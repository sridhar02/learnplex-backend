import { createParamDecorator } from 'type-graphql'

import { MyContext } from '../types/MyContext'
import { User } from '../entity/User.entity'

export default function CurrentUser(): ParameterDecorator {
  return createParamDecorator<MyContext>(async ({ context }) => {
    const userId = context.payload?.userId
    if (!userId) {
      return null
    }
    const [user] = await User.find({ where: { id: userId }, take: 1 })
    return user
  })
}
