import _ from 'lodash'
import { z } from 'zod'

import { ChatModel } from '~/core/chat/ChatModel'

import { chatTable } from '~/core/chat/ChatTable'
import { settingTable } from '~/core/setting/SettingTable'

import { importLegacyMessage, LegacyMessage } from '~/core/message/importLegacyMessage'

const LegacyChat = z.object({
  id: z.number(),
  name: z.string(),
  messages: z.array(LegacyMessage),
})

const LegacyChatStore = z.object({
  chats: z.array(LegacyChat),
  selectedChat: z.number(),
})

type LegacyChat = z.infer<typeof LegacyChat>

type LegacyChatStore = z.infer<typeof LegacyChatStore>

const importLegacyChat = async (legacyChat: LegacyChat) => {
  const messageIds: string[] = []

  let lastMessageTimestamp: number = -1

  for (const oldMessage of legacyChat.messages) {
    const [message] = await importLegacyMessage(oldMessage)

    messageIds.push(message.id)

    if (_.gt(message.timestamp, lastMessageTimestamp)) {
      lastMessageTimestamp = message.timestamp
    }
  }

  const chat = chatTable.parse({
    ...legacyChat,
    messageIds,
    lastMessageTimestamp: _.lt(lastMessageTimestamp, 0) ? undefined : lastMessageTimestamp,
  })

  await chatTable.put(chat)

  return [chat]
}

const importLegacyChatStore = async (legacyChatStore: LegacyChatStore) => {
  const { chats, selectedChat: selectedChatId } = legacyChatStore

  const records = []

  for await (const legacyChat of chats) {
    const [chat] = await importLegacyChat(legacyChat)

    if (selectedChatId === legacyChat.id) {
      await settingTable.put({ selectedChatId: chat.id })
    }

    records.push(chat)
  }

  await chatTable.bulkInsert(records)

  return records
}

export const importLegacyChatItem = async (entity: unknown): Promise<ChatModel[] | undefined> => {
  const { data: oldChatStore } = LegacyChatStore.safeParse(entity)

  if (oldChatStore) {
    return await importLegacyChatStore(oldChatStore)
  }

  const { data: oldChat } = LegacyChat.safeParse(entity)

  if (oldChat) {
    return await importLegacyChat(oldChat)
  }

  return undefined
}
