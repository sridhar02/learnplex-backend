import { hash } from 'bcryptjs'
import { Field, ID, Int, ObjectType } from 'type-graphql'
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  BeforeInsert,
  OneToMany,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm'

import { UserRole } from './enums/UserRole.enum'
import { Resource } from './Resource.entity'
import { Progress } from './Progress.entity'
import { Profile } from './Profile.entity'

@ObjectType()
@Entity('users')
export class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number

  @Field({ nullable: true })
  @Column({ nullable: true })
  name: string

  @Column('int', { default: 0 })
  tokenVersion: number

  @Field({ nullable: true })
  @Index({ unique: true, where: 'email IS NOT NULL' })
  @Column('text', { nullable: true })
  email: string

  @Field()
  @Column('text', { unique: true })
  username: string

  @Column()
  password: string

  @Field()
  @Column('bool', { default: false })
  confirmed: boolean

  @Field(() => Boolean)
  disabledOrConfirmed(): boolean {
    const isEmailDisabled = process.env.IS_EMAIL_VERIFICATION_ENABLED !== '1'
    return isEmailDisabled || this.confirmed
  }

  @Field(() => [UserRole])
  @Column({
    type: 'enum',
    enum: UserRole,
    array: true,
    default: [UserRole.USER],
  })
  roles: UserRole[]

  @Field(() => Int, { nullable: true })
  @Column('int', { default: null })
  githubId: number

  @Field(() => [Resource])
  @OneToMany(() => Resource, (resource) => resource.user)
  resources: Promise<Resource[]>

  @Field(() => [Progress])
  @OneToMany(() => Progress, (progress) => progress.user)
  progressList: Promise<Progress[]>

  @Field()
  @CreateDateColumn()
  createdDate: Date

  @Field()
  @UpdateDateColumn()
  updatedDate: Date

  @Field(() => Profile, { nullable: true })
  @OneToOne(() => Profile, (profile) => profile.user)
  @JoinColumn()
  profile: Promise<Profile>

  @Field(() => Int, { nullable: true })
  @Column('int', { nullable: true })
  profileId: number

  @BeforeInsert()
  async hashPassword(): Promise<void> {
    this.password = await hash(this.password, 12)
  }
}
