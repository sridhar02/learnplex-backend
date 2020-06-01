import { buildSchema } from 'type-graphql'

import { ChangePasswordResolver } from '../modules/user/ChangePassword.resolver'
import { ConfirmUserResolver } from '../modules/user/ConfirmUser.resolver'
import { ForgotPasswordResolver } from '../modules/user/ForgotPassword.resolver'
import { LoginResolver } from '../modules/user/Login.resolver'
import { LogoutResolver } from '../modules/user/Logout.resolver'
import { MeResolver } from '../modules/user/Me.resolver'
import { RegisterResolver } from '../modules/user/Register.resolver'
import { RevokeTokensForUserResolver } from '../modules/user/RevokeTokensForUserResolver'
import { UsersResolver } from '../modules/user/Users.Resolver'
import { GraphQLSchema } from 'graphql'
import { SendConfirmationMailResolver } from '../modules/user/SendConfirmationMail.resolver'
import { CreateTopicResolver } from '../modules/resource/CreateTopic.resolver'
import { TopicsResolver } from '../modules/resource/Topics.resolver'
import { CreateResourceResolver } from '../modules/resource/CreateResource.resolver'
import { AddSectionResolver } from '../modules/resource/AddSection.resolver'
import { ResourcesResolver } from '../modules/resource/Resources.resolver'
import { SectionsResolver } from '../modules/resource/Sections.resolver'
import { UpdateSectionResolver } from '../modules/resource/UpdateSection.resolver'
import { DeleteSectionResolver } from '../modules/resource/DeleteSection.resolver'
import { ReorderSectionsResolver } from '../modules/resource/ReorderSections.resolver'
import { SavePageResolver } from '../modules/resource/SavePage.resolver'
import { ForkResourceResolver } from '../modules/resource/ForkResource.resolver'
import { CompleteSectionResolver } from '../modules/resource/CompleteSection.resolver'
import { UserProgressResolver } from '../modules/resource/UserProgress.resolver'
import { UpdateResourceResolver } from '../modules/resource/UpdateResource.resolver'
import { SearchResourceResolver } from '../modules/resource/SearchResource.resolver'
import { UpdateUserResolver } from '../modules/user/UpdateUser.resolver'
import { PublishResourcesResolver } from '../modules/resource/PublishResources.resolver'
import { PopulateSlugsResolver } from '../modules/resource/PopulateSlugs.resolver'
import { CreateResourceResolverV2 } from '../modules/resolvers/resource/CreateResource.resolver'
import { SectionsListResolver } from '../modules/resolvers/section/SectionsList.resolver'
import { SetDepthsResolver } from '../modules/migrations/SetDepths.resolver'
import { ProfileResolver } from '../modules/resolvers/user/profile/Profile.resolver'

export const createSchema: () => Promise<GraphQLSchema> = () =>
  buildSchema({
    resolvers: [
      ChangePasswordResolver,
      ConfirmUserResolver,
      ForgotPasswordResolver,
      LoginResolver,
      LogoutResolver,
      MeResolver,
      RegisterResolver,
      RevokeTokensForUserResolver,
      UsersResolver,
      SendConfirmationMailResolver,
      CreateTopicResolver,
      TopicsResolver,
      CreateResourceResolver,
      ResourcesResolver,
      AddSectionResolver,
      SectionsResolver,
      UpdateSectionResolver,
      DeleteSectionResolver,
      ReorderSectionsResolver,
      SavePageResolver,
      ForkResourceResolver,
      CompleteSectionResolver,
      UserProgressResolver,
      UpdateResourceResolver,
      SearchResourceResolver,
      UpdateUserResolver,
      PublishResourcesResolver,
      PopulateSlugsResolver,
      CreateResourceResolverV2,
      SectionsListResolver,
      SetDepthsResolver,
      ProfileResolver,
    ],
    authChecker: ({ context: { req } }) => {
      return !!req.userId
    },
  })
