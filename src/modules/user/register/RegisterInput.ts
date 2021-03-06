import { Field, InputType } from 'type-graphql'
import { Length, IsEmail } from 'class-validator'

import { PasswordInput } from '../../shared/PasswordInput'
import { IsEmailAlreadyExist } from './IsEmailAlreadyExist'
import { IsUsernameAlreadyExist } from './IsUsernameAlreadyExist'

@InputType({ isAbstract: true })
export class RegisterInput extends PasswordInput {
  @Field()
  @Length(1, 255)
  name: string

  @Field()
  @IsEmail()
  @IsEmailAlreadyExist({ message: 'Email already in use' })
  email: string

  @Field()
  @Length(1, 255)
  @IsUsernameAlreadyExist({ message: 'Username already in use' })
  username: string
}
