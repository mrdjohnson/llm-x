import { Factory } from 'fishery'
import { generateMock } from '@anatine/zod-mock'
import _ from 'lodash'

import { ChatModel } from '~/core/chat/ChatModel'
import { ChatViewModel } from '~/core/chat/ChatViewModel'
import { chatStore } from '~/core/chat/ChatStore'
import { type ActorViewModel } from '~/core/actor/ActorViewModel'
import { MessageModel } from '~/core/message/MessageModel'

import { ActorConnectionOptions, ActorModelFactory } from '~/core/actor/ActorModel.factory'
import { MessageModelFactory } from '~/core/message/MessageModel.factory'

type ChatFactoryOptions = ActorConnectionOptions & {
  chatParams?: Partial<ChatModel>

  actors?: ActorViewModel[]
  actorCount?: number

  messages?: MessageModel[]
  messageCount?: number
}
class ChatModelFactoryClass extends Factory<ChatModel, null, ChatViewModel> {
  withOptions({
    actors,
    actorCount,
    messages,
    messageCount,
    chatParams,
    ...options
  }: ChatFactoryOptions = {}) {
    // if messages or actors is defined, set their ids
    return (
      this.params(chatParams || {})
        // actors
        .params({ actorIds: _.map(actors, 'id') })
        .afterCreate(async chat => {
          if (actors || !_.isNumber(actorCount)) return chat

          // create actors and add the ids
          actors = await ActorModelFactory.withOptions(options).createList(actorCount)

          await chat.update({ actorIds: _.map(actors, 'id') })

          return chat
        })

        // messages
        .params({ messageIds: _.map(messages, 'id') })
        .afterCreate(async chat => {
          if (messages || !_.isNumber(messageCount)) return chat

          // create messages and add the ids
          messages = await MessageModelFactory.createList(messageCount)

          await chat.update({ messageIds: _.map(messages, 'id') })
          await chat.fetchMessages()

          return chat
        })
    )
  }
}

export const ChatModelFactory = ChatModelFactoryClass.define(({ sequence, params, onCreate }) => {
  onCreate(async chatModel => {
    const chatViewModel = await chatStore.createChat()

    await chatViewModel.update({ ...chatModel, id: chatViewModel.id })

    return chatViewModel
  })

  return {
    ...generateMock(ChatModel),
    // do not generate fake ids
    actorIds: [],
    messageIds: [],
    ...params,
    id: sequence.toString(),
  }
})
