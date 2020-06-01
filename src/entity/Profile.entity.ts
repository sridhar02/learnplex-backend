import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Field, ID, ObjectType } from 'type-graphql'

import { User } from './User.entity'

@ObjectType({ isAbstract: true })
class ProfessionalDetails {
  @Field({ nullable: true })
  currentCompanyName: string

  @Field({ nullable: true })
  currentRole: string

  @Field({ defaultValue: false })
  lookingForJob: boolean

  @Field({ nullable: true })
  location: string
}

@ObjectType({ isAbstract: true })
class SocialLinks {
  @Field({ nullable: true })
  github: string

  @Field({ nullable: true })
  twitter: string

  @Field({ nullable: true })
  linkedin: string

  @Field({ nullable: true })
  personalWebsite: string
}

@ObjectType()
@Entity('profiles')
export class Profile extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number

  @Field()
  @Column('varchar', { length: 100, default: '' })
  shortBio: string

  @Field()
  @Column({ default: '' })
  profilePic: string

  @Field(() => [String])
  @Column('simple-array')
  technologies: string[]

  @Field(() => SocialLinks)
  @Column('simple-json', {
    default: { github: '', twitter: '', linkedin: '', personalWebsite: '' },
  })
  socialLinks: {
    github: string
    twitter: string
    linkedin: string
    personalWebsite: string
  }

  @Field()
  @Column({ default: false })
  isEmailPublic: boolean

  @Field(() => ProfessionalDetails)
  @Column('simple-json', {
    default: {
      currentCompanyName: '',
      currentRole: '',
      lookingForJob: false,
      location: '',
    },
  })
  professionalDetails: {
    currentCompanyName: string
    currentRole: string
    lookingForJob: boolean
    location: string
  }

  @Field(() => User)
  @OneToOne(() => User, (user) => user.profile)
  user: Promise<User>

  @Field()
  @CreateDateColumn()
  createdDate: Date

  @Field()
  @UpdateDateColumn()
  updatedDate: Date
}
