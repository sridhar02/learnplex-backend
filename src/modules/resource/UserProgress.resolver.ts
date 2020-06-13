import { Arg, Query, Resolver, UseMiddleware } from 'type-graphql'

import { Progress } from '../../entity/Progress.entity'
import { isAuthorized } from '../middleware/isAuthorized'
import { User } from '../../entity/User.entity'
import CurrentUser from '../../decorators/currentUser'
import { getResource } from '../utils/getResourceFromUsernameAndSlug'

@Resolver()
export class UserProgressResolver {
  @Query(() => Progress, { nullable: true })
  @UseMiddleware(isAuthorized)
  async userProgress(
    @Arg('resourceSlug') resourceSlug: string,
    @Arg('ownerUsername') ownerUsername: string,
    @CurrentUser() currentUser: User
  ): Promise<Progress | null> {
    const resource = await getResource(ownerUsername, resourceSlug)
    if (!resource) {
      return null
    }
    const [progress] = await Progress.find({
      where: { userId: currentUser.id, resourceId: resource.id },
    })
    return progress
  }

  @Query(() => Progress, { nullable: true })
  @UseMiddleware(isAuthorized)
  async userProgressByResourceId(
    @Arg('resourceId') resourceId: string,
    @CurrentUser() currentUser: User
  ): Promise<Progress> {
    const [progress] = await Progress.find({
      where: { userId: currentUser.id, resourceId },
      take: 1,
    })
    return progress
  }

  @Query(() => [Progress])
  @UseMiddleware(isAuthorized)
  async userProgressList(
    @CurrentUser() currentUser: User
  ): Promise<Progress[]> {
    return Progress.find({ where: { userId: currentUser.id } })
  }

  @Query(() => [Progress])
  async userProgressListByUsername(
    @Arg('username') username: string
  ): Promise<Progress[]> {
    const [user] = await User.find({ where: { username }, take: 1 })
    if (!user) {
      throw new Error('Invalid User')
    }
    return Progress.find({ where: { userId: user.id } })
  }

  @Query(() => Boolean)
  @UseMiddleware(isAuthorized)
  async hasEnrolled(
    @Arg('username') username: string,
    @Arg('resourceSlug') resourceSlug: string,
    @CurrentUser() currentUser: User
  ): Promise<boolean> {
    const resource = await getResource(username, resourceSlug)
    if (!resource) {
      throw new Error('Invalid Resource')
    }
    const [progress] = await Progress.find({
      where: { resourceId: resource.id, userId: currentUser.id },
    })
    return !!progress
  }

  @Query(() => Boolean)
  @UseMiddleware(isAuthorized)
  async hasEnrolledByResourceId(
    @Arg('resourceId') resourceId: string,
    @CurrentUser() currentUser: User
  ): Promise<boolean> {
    console.log({ resourceId, currentUser })
    const [progress] = await Progress.find({
      where: { resourceId, userId: currentUser.id },
      take: 1,
    })
    console.log({ progress })
    return !!progress
  }

  @Query(() => Boolean)
  @UseMiddleware(isAuthorized)
  async hasCompletedSection(
    @Arg('resourceId') resourceId: string,
    @Arg('sectionId') sectionId: string,
    @CurrentUser() currentUser: User
  ) {
    const progresses = await Progress.find({
      where: {
        resourceId,
        userId: currentUser.id,
      },
    })
    console.log({ progresses })
    const [progress] = await Progress.find({
      where: { resourceId, userId: currentUser.id },
    })
    console.log({ progress })
    if (!progress) {
      return false
    }
    const completedSections = await progress.completedSections
    const completedSectionIds = completedSections.map((section) => section.id)
    console.log(completedSectionIds, sectionId)
    return completedSectionIds.includes(sectionId)
  }
}
