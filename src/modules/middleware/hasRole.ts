import { MiddlewareFn } from 'type-graphql'

import { MyContext } from '../../types/MyContext'
import { UserRole } from '../../entity/enums/UserRole.enum'
import { User } from '../../entity/User.entity'

export const hasRole: (roles: UserRole[]) => MiddlewareFn<MyContext> = (
  roles: UserRole[]
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
) => async ({ context }, next) => {
  let user: User
  try {
    const [findUser] = await User.find({
      where: { id: context.payload!.userId },
      take: 1,
    })
    user = findUser
  } catch (e) {
    console.error(e)
    throw new Error('not authenticated')
  }

  const containsRole =
    roles.filter((role) => user.roles.includes(role)).length !== 0
  if (!containsRole) {
    throw new Error('not authorized')
  }

  return next()
}
