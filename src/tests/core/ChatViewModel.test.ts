import { describe, expect, test, vi } from 'vitest'
import _ from 'lodash'

import { setServerPostResponse } from '~/tests/msw'

import { messageTable } from '~/core/message/MessageTable'
import { ChatModelFactory } from '~/core/chat/ChatModel.factory'
import { ActorModelFactory } from '~/core/actor/ActorModel.factory'
import { ConnectionModelFactory } from '~/core/connection/ConnectionModel.factory'
import { ActorViewModel } from '~/core/actor/ActorViewModel'
import { connectionStore } from '~/core/connection/ConnectionStore'

describe('ChatViewModel', () => {
  test('constructs with a ChatModel and exposes properties', async () => {
    const chat = await ChatModelFactory.create({ name: 'Test Chat' })

    expect(chat.name).toBe('Test Chat')
    expect(chat.messages).toEqual([])
    expect(chat.actors).toEqual([])
  })

  test('can add and fetch messages', async () => {
    const message = await messageTable.create({ fromBot: false, content: 'Hello' })
    const chat = await ChatModelFactory.withOptions({ messages: [message] }).create()

    await chat.fetchMessages()

    expect(chat.messages.length).toBe(1)
    expect(chat.messages[0].content).toBe('Hello')
  })

  test('can add and remove actors', async () => {
    const chat = await ChatModelFactory.withOptions({ modelCount: 1, actorCount: 1 }).create()

    const [actor] = chat.actors

    // Remove the actor
    await chat.removeActorById(actor.id)
    expect(chat.source.actorIds).not.toContain(actor.id)
  })

  test('can add a user message and update chat name', async () => {
    const chat = await ChatModelFactory.create({ name: undefined })

    await chat.addUserMessage('First message')
    expect(chat.source.messageIds.length).toBe(1)

    expect(chat.messages[0].content).toBe('First message')
    // Name should be updated from default
    expect(chat.source.name).toBe('First message')
  })

  test('can remove user messages', async () => {
    const chat = await ChatModelFactory.withOptions({ messageCount: 3, actorCount: 0 }).create()

    const [firstMessage, secondMessage, thirdMessage] = chat.messages

    expect(chat.source.messageIds.length).toBe(3)

    await chat.destroyMessage(secondMessage)

    expect(chat.messages).toEqual([firstMessage, thirdMessage])
  })

  test('isImageGenerationMode if all models generate images', async () => {
    const a1111Connection = await ConnectionModelFactory.create({ type: 'A1111' })
    const ollamaConnection = await ConnectionModelFactory.withOptions({ modelCount: 2 }).create({
      type: 'Ollama',
    })

    const [ollamaImageModel, ollamaTextModel] = ollamaConnection.models

    setServerPostResponse(
      `${ollamaConnection.formattedHost}/api/show`,
      async (body: { model: string }) => {
        return {
          capabilities: body.model === ollamaImageModel.modelName ? ['image'] : [],
        }
      },
    )

    const [imageActor1, imageActor2] = await ActorModelFactory.createList(2, {
      connectionId: a1111Connection.id,
    })
    const [textActor1, textActor2] = await ActorModelFactory.createList(2, {
      connectionId: ollamaConnection.id,
      modelId: ollamaTextModel.id,
    })
    const [ollamaImageActor1, ollamaImageActor2] = await ActorModelFactory.createList(2, {
      connectionId: ollamaConnection.id,
      modelId: ollamaImageModel.id,
    })

    const expectChatWithActorsToBe = async (
      actors: ActorViewModel[],
      isImageGenerationMode: boolean,
    ) => {
      const chat = await ChatModelFactory.withOptions({ actors, actorCount: 0 }).create()

      expect(chat.isImageGenerationMode).toBe(isImageGenerationMode)
    }

    await expectChatWithActorsToBe([imageActor1, textActor1], false)

    await expectChatWithActorsToBe([textActor1], false)

    await expectChatWithActorsToBe([textActor1, textActor2], false)

    await expectChatWithActorsToBe([imageActor1, imageActor2, textActor1], false)

    await vi.waitFor(() => expect(ollamaImageActor1.isImageGenerator).toBe(true))

    await expectChatWithActorsToBe([ollamaImageActor1], true)

    await expectChatWithActorsToBe([ollamaImageActor1, ollamaImageActor2], true)

    await expectChatWithActorsToBe([imageActor1, ollamaImageActor1], true)

    await expectChatWithActorsToBe([ollamaImageActor1, textActor1], false)

    // set default actor type
    await connectionStore.setSelectedConnection(ollamaConnection)

    await expectChatWithActorsToBe([], false)

    await expectChatWithActorsToBe([imageActor1], true)

    await expectChatWithActorsToBe([imageActor1, imageActor2], true)

    // set default actor type
    await connectionStore.setSelectedConnection(a1111Connection)

    await expectChatWithActorsToBe([], true)
  })
})
