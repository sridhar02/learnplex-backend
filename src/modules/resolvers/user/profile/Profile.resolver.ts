import { Arg, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql'

import { isAuthorized } from '../../../middleware/isAuthorized'
import CurrentUser from '../../../../decorators/currentUser'
import { User } from '../../../../entity/User.entity'
import { Profile } from '../../../../entity/Profile.entity'
import { ProfileInput } from './inputs/ProfileInput'

@Resolver()
export class ProfileResolver {
  @Mutation(() => Profile)
  @UseMiddleware(isAuthorized)
  async updateProfile(
    @Arg('data')
    {
      shortBio,
      technologies,
      socialLinks,
      isEmailPublic,
      professionalDetails,
      profilePic,
    }: ProfileInput,
    @CurrentUser() currentUser: User
  ): Promise<Profile> {
    if (currentUser.profileId) {
      const profile = await currentUser.profile
      profile.shortBio = shortBio
      profile.technologies = technologies
      profile.socialLinks = socialLinks
      profile.isEmailPublic = isEmailPublic
      profile.professionalDetails = professionalDetails
      profile.profilePic = profilePic
      return profile.save()
    }
    const profile = new Profile()
    profile.shortBio = shortBio
    profile.technologies = technologies
    profile.socialLinks = socialLinks
    profile.isEmailPublic = isEmailPublic
    profile.professionalDetails = professionalDetails
    profile.profilePic = profilePic
    await profile.save()
    currentUser.profileId = profile.id
    await currentUser.save()
    return profile
  }

  @Query(() => User)
  async userByUsername(@Arg('username') username: string) {
    const [user] = await User.find({ where: { username }, take: 1 })
    if (!user) {
      throw new Error('Invalid username')
    }
    return user
  }
}
