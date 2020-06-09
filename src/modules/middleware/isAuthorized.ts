import { MiddlewareFn } from 'type-graphql'
import { verify } from 'jsonwebtoken'

import { MyContext } from '../../types/MyContext'
import {
  createAccessToken,
  createRefreshToken,
  JWTAuthPayload,
  sendAccessToken,
  sendRefreshToken,
} from '../../utils/auth'
import { User } from '../../entity/User.entity'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const refreshToken = async (context: MyContext) => {
  let payload: JWTAuthPayload
  try {
    const refreshToken =
      context.req.cookies[`${process.env.REFRESH_COOKIE_NAME}`]
    payload = verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as JWTAuthPayload
  } catch (e) {
    throw new Error('not authenticated')
  }
  const [user] = await User.find({ where: { id: payload.userId }, take: 1 })

  if (!user) {
    console.error(`User ${payload.userId} is not defined`)
    throw new Error('not authenticated')
  }

  if (user.tokenVersion !== payload.tokenVersion) {
    console.error(`token version mismatch for user ${user.id}`)
    throw new Error('not authenticated')
  }

  sendRefreshToken(context.res, createRefreshToken(user))
  sendAccessToken(context.res, createAccessToken(user.id))
  return payload
}

export const getAuthorizationPayloadFromToken = (context: MyContext) => {
  let payload
  console.log({ cookies: JSON.stringify(context.req.cookies) })

  try {
    const token = context.req.cookies[`${process.env.ACCESS_COOKIE_NAME}`]
    payload = verify(token, process.env.ACCESS_TOKEN_SECRET!) as JWTAuthPayload
  } catch (e) {
    // console.error(e)
    try {
      payload = refreshToken(context)
    } catch (e) {
      throw new Error('not authenticated')
    }
  }

  return payload
}

export const isAuthorized: MiddlewareFn<MyContext> = async (
  { context },
  next
) => {
  context.payload = await getAuthorizationPayloadFromToken(context)
  return next()
}
