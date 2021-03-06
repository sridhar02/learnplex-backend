import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql'

import { User } from '../../entity/User.entity'
import { isAuthorized } from '../middleware/isAuthorized'
import { MyContext } from '../../types/MyContext'
import { UserRole } from '../../entity/enums/UserRole.enum'
import { hasRole } from '../middleware/hasRole'
import { getConnection } from 'typeorm'

@ObjectType()
class UsersCount {
  @Field()
  createdDate: Date

  @Field()
  count: number

  @Field()
  cumulativeCount: number
}

@Resolver()
export class UsersResolver {
  @Query(() => String)
  hello() {
    return 'Hello'
  }

  @UseMiddleware(isAuthorized, hasRole([UserRole.USER]))
  @Query(() => String)
  bye(@Ctx() { payload }: MyContext) {
    return `your user id is ${payload!.userId}`
  }

  @Query(() => [User])
  @UseMiddleware(isAuthorized, hasRole([UserRole.ADMIN]))
  users(): Promise<User[]> {
    return User.find({ order: { id: 'ASC' } })
  }

  @Query(() => [UsersCount])
  @UseMiddleware(isAuthorized, hasRole([UserRole.ADMIN]))
  async usersCountByDate(): Promise<UsersCount[]> {
    const usersCount = await getConnection()
      .getRepository(User)
      .createQueryBuilder('user')
      .select('DATE(user.createdDate)', 'createdDate')
      .addSelect('COUNT(user.id)', 'count')
      .groupBy('DATE(user.createdDate)')
      .getRawMany()
    usersCount.sort((a, b) => a.createdDate - b.createdDate)
    let prevSum = 0
    usersCount.forEach((userCount) => {
      userCount.cumulativeCount = prevSum + Number(userCount.count)
      prevSum += Number(userCount.count)
    })
    return usersCount
  }

  @Mutation(() => Boolean)
  async validateEmail(@Arg('email') email: string): Promise<boolean> {
    const [user] = await User.find({ where: { email } })
    return !user
  }

  @Mutation(() => Boolean)
  async validateUsername(@Arg('username') username: string): Promise<boolean> {
    const [user] = await User.find({ where: { username } })
    return !user
  }
}
