import { describe, expect, test } from 'vitest'
import _ from 'lodash'

import { messageTable } from '~/core/message/MessageTable'
import { ChatModelFactory } from '~/core/chat/ChatModel.factory'

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
})
