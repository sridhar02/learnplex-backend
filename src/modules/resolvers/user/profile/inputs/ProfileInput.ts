import { Field, InputType } from 'type-graphql'
import { MaxLength } from 'class-validator'

import { Profile } from '../../../../../entity/Profile.entity'

@InputType()
class SocialLinksInput {
  @Field({ nullable: true })
  github: string

  @Field({ nullable: true })
  twitter: string

  @Field({ nullable: true })
  linkedin: string

  @Field({ nullable: true })
  personalWebsite: string
}

@InputType()
export class ProfessionalDetailsInput {
  @Field({ nullable: true })
  currentCompanyName: string

  @Field({ nullable: true })
  currentRole: string

  @Field({ defaultValue: false })
  lookingForJob: boolean

  @Field({ nullable: true })
  location: string
}

@InputType({ isAbstract: true })
export class ProfileInput implements Partial<Profile> {
  @Field({ nullable: true })
  @MaxLength(100)
  shortBio: string

  @Field(() => [String], { nullable: true })
  technologies: string[]

  @Field(() => SocialLinksInput, { nullable: true })
  socialLinks: {
    github: string
    twitter: string
    linkedin: string
    personalWebsite: string
  }

  @Field()
  isEmailPublic: boolean

  @Field(() => ProfessionalDetailsInput, { nullable: true })
  professionalDetails: {
    currentCompanyName: string
    currentRole: string
    lookingForJob: boolean
    location: string
  }

  @Field()
  profilePic: string
}
