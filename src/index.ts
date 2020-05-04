import 'dotenv/config'
import 'reflect-metadata'
import express from 'express'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import cors from 'cors'
import passport from 'passport'
import { verify } from 'jsonwebtoken'
import { ApolloServer } from 'apollo-server-express'
import { createConnection, getConnection } from 'typeorm'
import { separateOperations } from 'graphql'
import {
  fieldExtensionsEstimator,
  getComplexity,
  simpleEstimator,
} from 'graphql-query-complexity'
import { Strategy as GitHubStrategy } from 'passport-github2'
import { generate } from 'generate-password'
import { VerifyCallback } from 'passport-oauth2'

import { createSchema } from './utils/createSchema'
import {
  createAccessToken,
  createRefreshToken,
  JWTAuthPayload,
  sendAccessToken,
  sendRefreshToken,
} from './utils/auth'
import { User } from './entity/User.entity'
import { UserRole } from './entity/enums/UserRole.enum'
import { getAuthorizationPayloadFromToken } from './modules/middleware/isAuthorized'

const main = async (): Promise<void> => {
  const app = express()

  app.use(
    cors({
      credentials: true,
      origin:
        process.env.NODE_ENV === 'production'
          ? 'https://coderplex.in/'
          : 'http://localhost:3000',
    })
  )

  app.use(compression())
  app.use(cookieParser())
  app.use(bodyParser.json())
  app.use(passport.initialize())

  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        callbackURL: 'http://127.0.0.1:4000/auth/github/callback',
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (_: string, __: string, profile: any, done: VerifyCallback) => {
        const { name, email, id: githubId, login } = profile._json

        const password = generate({
          length: 15,
          numbers: true,
          lowercase: true,
          uppercase: true,
          symbols: true,
        })

        const username = login + '-coderplex'

        let user = await getConnection()
          .getRepository(User)
          .createQueryBuilder('user')
          .where('user.githubId = :id', { id: githubId })
          .orWhere('user.email = :email', { email })
          .getOne()

        if (!user) {
          // user needs to be registered
          user = await User.create({
            name,
            email,
            githubId,
            username,
            password,
            confirmed: true,
          })
        } else if (!user.githubId) {
          // found user by email
          // merge account
          user.githubId = githubId
        } else {
          // user already exists
        }

        user = await user.save()
        return done(null, user)
      }
    )
  )

  app.get('/auth/github', passport.authenticate('github'))

  app.get(
    '/auth/github/callback',
    passport.authenticate('github', {
      failureRedirect: '/error',
      session: false,
    }),
    (req, res) => {
      // Successful authentication, redirect to frontend.
      const user: User = req.user as User
      sendRefreshToken(res, createRefreshToken(user))
      res.redirect(
        `http://localhost:3000?accessToken=${createAccessToken(
          user.id
        )}&refreshToken=${createRefreshToken(user)}&oauth=${true}`
      )
    }
  )

  app.post('/modify_user_roles', async (req, res) => {
    // TODO: Check if authorized, Right now we are just checking if user is authenticated
    try {
      getAuthorizationPayloadFromToken({ req, res })
    } catch (e) {
      console.log(e)
      return res.send({ ok: false, message: 'Not authorized' })
    }

    const role: UserRole = req.body.role
    const type = req.body.type

    if (!role) {
      res.send({ ok: false, message: 'invalid role' })
    }
    if (type !== 'ADD' && type !== 'REMOVE') {
      res.send({ ok: false, message: 'invalid operation' })
    }
    const [user] = await User.find({ where: { id: req.body.userId }, take: 1 })

    if (!user) {
      res.send({ ok: false, message: 'invalid userId' })
    }

    if (type === 'ADD' && !user.roles.includes(role)) {
      user.roles.push(role)
    }
    if (type === 'REMOVE' && user.roles.includes(role)) {
      user.roles.splice(user.roles.indexOf(role), 1)
    }
    await user.save()
    return res.send({ ok: true, message: 'Modified user roles' })
  })

  app.post('/refresh_token', async (req, res) => {
    const token = req.cookies[`${process.env.REFRESH_COOKIE_NAME}`]
    if (!token) {
      console.error(`Invalid token ${token}`)
      return res.send({ ok: false, accessToken: '' })
    }

    let payload: JWTAuthPayload

    try {
      payload = verify(
        token,
        process.env.REFRESH_TOKEN_SECRET!
      ) as JWTAuthPayload
    } catch (e) {
      console.error(e)
      return res.send({ ok: false, accessToken: '' })
    }

    const [user] = await User.find({ where: { id: payload.userId }, take: 1 })

    if (!user) {
      console.error(`User ${payload.userId} is not defined`)
      return res.send({ ok: false, accessToken: '' })
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      console.error(`token version mismatch for user ${user.id}`)
      return res.send({ ok: false, accessToken: '' })
    }

    sendRefreshToken(res, createRefreshToken(user))
    sendAccessToken(res, createAccessToken(user.id))

    return res.send({ ok: true, accessToken: createAccessToken(user.id) })
  })

  await createConnection()

  const schema = await createSchema()
  const MAX_COMPLEXITY = 45
  const apolloServer = new ApolloServer({
    schema,
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    context: ({ req, res }) => ({ req, res }),
    tracing: true,
    plugins: [
      {
        requestDidStart: () => ({
          didResolveOperation({ request, document }): void {
            /**
             * This provides GraphQL query analysis to be able to react on complex queries to your GraphQL server.
             * This can be used to protect your GraphQL servers against resource exhaustion and DoS attacks.
             * More documentation can be found at https://github.com/ivome/graphql-query-complexity.
             */
            const complexity = getComplexity({
              // Our built schema
              schema,
              // To calculate query complexity properly,
              // we have to check if the document contains multiple operations
              // and eventually extract it operation from the whole query document.
              query: request.operationName
                ? separateOperations(document)[request.operationName]
                : document,
              // The variables for our GraphQL query
              variables: request.variables,
              // Add any number of estimators. The estimators are invoked in order, the first
              // numeric value that is being returned by an estimator is used as the field complexity.
              // If no estimator returns a value, an exception is raised.
              estimators: [
                // Using fieldConfigEstimator is mandatory to make it work with type-graphql.
                // fieldConfigEstimator(), // <--- deprecated

                fieldExtensionsEstimator(),

                // Add more estimators here...
                // This will assign each field a complexity of 1
                // if no other estimator returned a value.
                simpleEstimator({ defaultComplexity: 1 }),
              ],
            })
            // Here we can react to the calculated complexity,
            // like compare it with max and throw error when the threshold is reached.
            if (complexity >= MAX_COMPLEXITY) {
              throw new Error(
                `Sorry, too complicated query! ${complexity} is over ${MAX_COMPLEXITY} that is the max allowed complexity.`
              )
            }
            // And here we can e.g. subtract the complexity point from hourly API calls limit.
            if (complexity > 0) {
              console.log('Used query complexity points:', complexity)
            }
          },
        }),
      },
    ],
  })
  apolloServer.applyMiddleware({ app, cors: false })

  app.listen(4000, () => {
    console.log('server started at http://localhost:4000/graphql')
  })
}

main()
