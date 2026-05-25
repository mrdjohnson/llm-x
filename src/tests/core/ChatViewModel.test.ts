import { describe, expect, test, vi } from 'vitest'
import _ from 'lodash'

import { setServerResponseForOllamaShowByModelName } from '~/tests/helpers/setServerResponseForModels'

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
    // Create Ollama connection first without custom models
    const ollamaConnection = await ConnectionModelFactory.withOptions({
      modelCount: 2,
    }).create({
      type: 'Ollama',
      host: 'http://ollama-host:4444',
    })

    const [ollamaImageModel, ollamaTextModel] = ollamaConnection.models
    const imageModelName = ollamaImageModel.modelName

    // Clear the cache so it will refetch capabilities
    localStorage.removeItem(`ollama_model_capabilities_${ollamaConnection.id}`)

    // Now set up mock to return image capability only for the first model
    setServerResponseForOllamaShowByModelName(ollamaConnection.formattedHost, imageModelName)

    // Refetch models to get the capabilities
    await ollamaConnection.fetchLmModels()

    const [a1111ImageActor1, a1111ImageActor2] = await ActorModelFactory.withOptions({
      connectionParams: { type: 'A1111' },
    }).createList(2)

    const [textActor1, textActor2] = await ActorModelFactory.createList(2, {
      connectionId: ollamaConnection.id,
      modelId: ollamaTextModel.id,
    })

    const [ollamaImageActor1, ollamaImageActor2] = await ActorModelFactory.createList(2, {
      connectionId: ollamaConnection.id,
      modelId: ollamaImageModel.id,
    })

    // make sure the actors have the correct capabilities before testing chat mode
    await vi.waitFor(() => expect(a1111ImageActor1.isImageGenerator).toBe(true))
    await vi.waitFor(() => expect(ollamaImageActor1.isImageGenerator).toBe(true))
    await vi.waitFor(() => expect(ollamaImageActor2.isImageGenerator).toBe(true))
    expect(textActor1.isImageGenerator).toBe(false)
    expect(textActor2.isImageGenerator).toBe(false)

    const chatWithActors = async (actors: ActorViewModel[]) => {
      const chat = await ChatModelFactory.withOptions({ actors, actorCount: 0 }).create()

      return chat.isImageGenerationMode
    }

    expect(await chatWithActors([a1111ImageActor1, textActor1])).toBe(false)

    expect(await chatWithActors([textActor1])).toBe(false)

    expect(await chatWithActors([textActor1, textActor2])).toBe(false)

    expect(await chatWithActors([a1111ImageActor1, a1111ImageActor2, textActor1])).toBe(false)

    // Now test Ollama image actors
    expect(await chatWithActors([ollamaImageActor1])).toBe(true)

    expect(await chatWithActors([ollamaImageActor1, ollamaImageActor2])).toBe(true)

    expect(await chatWithActors([a1111ImageActor1, ollamaImageActor1])).toBe(true)

    expect(await chatWithActors([ollamaImageActor1, textActor1])).toBe(false)

    expect(await chatWithActors([a1111ImageActor1])).toBe(true)

    expect(await chatWithActors([a1111ImageActor1, a1111ImageActor2])).toBe(true)

    // set default actor type

    await connectionStore.setSelectedModel(ollamaImageModel.id, ollamaConnection.id)

    expect(await chatWithActors([])).toBe(true)

    await connectionStore.setSelectedModel(ollamaTextModel.id, ollamaConnection.id)

    expect(await chatWithActors([])).toBe(false)

    await connectionStore.setSelectedModel(
      a1111ImageActor1.model!.id,
      a1111ImageActor1.connection!.id,
    )

    expect(await chatWithActors([])).toBe(true)
  })
})
