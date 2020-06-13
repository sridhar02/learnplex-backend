import { Arg, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql'

import { Resource } from '../../entity/Resource.entity'
import { isAuthorized } from '../middleware/isAuthorized'
import CurrentUser from '../../decorators/currentUser'
import { User } from '../../entity/User.entity'
import { Section } from '../../entity/Section.entity'
import { getResource } from '../utils/getResourceFromUsernameAndSlug'
import { Topic } from '../../entity/Topic.entity'
import { hasRole } from '../middleware/hasRole'
import { UserRole } from '../../entity/enums/UserRole.enum'

@Resolver()
export class ResourcesResolver {
  @UseMiddleware(isAuthorized)
  @Query(() => [Resource])
  async resources(@CurrentUser() currentUser: User): Promise<Resource[]> {
    return Resource.find({ where: { userId: currentUser.id } })
  }

  @Query(() => Resource)
  async primaryResourceBySlug(
    @Arg('resourceSlug') resourceSlug: string
  ): Promise<Resource> {
    const [resource] = await Resource.find({
      where: { slug: resourceSlug, verified: true },
    })
    if (!resource) {
      throw new Error('Resource not found')
    }
    return resource
  }

  @Query(() => Resource)
  async resourceBySlug(
    @Arg('resourceSlug') resourceSlug: string
  ): Promise<Resource> {
    const [resource] = await Resource.find({
      where: { slug: resourceSlug },
      take: 1,
    })
    if (!resource) {
      throw new Error('Resource not found')
    }
    return resource
  }

  @Query(() => [Resource])
  async resourcesByUsername(@Arg('username') username: string) {
    const [user] = await User.find({ where: { username } })
    if (!user) {
      throw new Error('Invalid username')
    }
    return Resource.find({ where: { userId: user.id } })
  }

  @Query(() => [Resource])
  async resourcesByTopic(@Arg('slug') slug: string) {
    const [topic] = await Topic.find({ where: { slug } })
    if (!topic) {
      throw new Error('Invalid topic')
    }
    return Resource.find({ where: { topicId: topic.id, published: true } })
  }

  @Query(() => Resource, { nullable: true })
  async resource(
    @Arg('username') username: string,
    @Arg('resourceSlug') slug: string
  ) {
    return getResource(username, slug)
  }

  @Query(() => [Resource])
  async allPublishedResources(): Promise<Resource[]> {
    return Resource.find({ published: true })
  }

  @Query(() => [Resource])
  async allResources(): Promise<Resource[]> {
    return Resource.find()
  }

  @Query(() => [Resource])
  async allResourcesForAdmin(): Promise<Resource[]> {
    return Resource.find()
  }

  @Query(() => [Resource])
  async allVerifiedResources(): Promise<Resource[]> {
    return Resource.find({ where: { verified: true } })
  }

  @Query(() => Section)
  async baseSection(
    @Arg('username') username: string,
    @Arg('resourceSlug') slug: string
  ) {
    const resource = await getResource(username, slug)
    if (!resource) {
      return null
    }
    const baseSection = await resource.baseSection
    const sections = await baseSection.sections
    baseSection.sections = Promise.resolve(
      sections.filter((section) => !section.deleted)
    )
    return baseSection
  }

  @UseMiddleware(isAuthorized, hasRole([UserRole.ADMIN]))
  @Mutation(() => Resource)
  async makePrimary(@Arg('resourceId') resourceId: string): Promise<Resource> {
    const [resource] = await Resource.find({ where: { id: resourceId } })
    if (!resource) {
      throw new Error('Resource Not found')
    }
    resource.verified = true
    return resource.save()
  }

  @UseMiddleware(isAuthorized, hasRole([UserRole.ADMIN]))
  @Mutation(() => Resource)
  async togglePrimaryStatus(
    @Arg('resourceId') resourceId: string
  ): Promise<Resource> {
    const [resource] = await Resource.find({ where: { id: resourceId } })
    if (!resource) {
      throw new Error('Resource Not found')
    }
    resource.verified = !resource.verified
    return resource.save()
  }

  @Query(() => Resource, { nullable: true })
  async resourceByOwnerUsernameAndSlug(
    @Arg('username') username: string,
    @Arg('resourceSlug') slug: string
  ) {
    return getResource(username, slug)
  }
}
