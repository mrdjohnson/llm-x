import { Factory } from 'fishery'
import { generateMock } from '@anatine/zod-mock'
import _ from 'lodash'

import { ChatModel } from '~/core/chat/ChatModel'
import { ChatViewModel } from '~/core/chat/ChatViewModel'
import { chatStore } from '~/core/chat/ChatStore'
import { ActorModelFactory } from '~/core/actor/ActorModel.factory'

type ChatFactoryTransientParams = {
  actorCount?: number
}

export const ChatModelFactory = Factory.define<
  ChatModel,
  ChatFactoryTransientParams,
  ChatViewModel
>(({ sequence, params, onCreate, transientParams }) => {
  onCreate(async chatModel => {
    const chatViewModel = await chatStore.createChat()

    await chatViewModel.update({ ...chatModel, id: chatViewModel.id })

    const actors = await ActorModelFactory.createList(transientParams?.actorCount ?? 0, {
      chatId: chatViewModel.id,
    })

    for (const actor of actors) {
      await chatViewModel.addActor(actor)
    }

    return chatViewModel
  })

  return {
    ...generateMock(ChatModel),
    ...params,
    id: sequence.toString(),
  }
})
