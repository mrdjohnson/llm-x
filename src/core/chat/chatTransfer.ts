import { z } from 'zod'
import _ from 'lodash'

import { ChatModel } from '~/core/chat/ChatModel'

import { chatTable } from '~/core/chat/ChatTable'

import { ExportedMessage, exportMessage, importMessage } from '~/core/message/messageTransfer'
import { messageTable } from '~/core/message/MessageTable'

const ExportedChat = ChatModel.omit({
  messageIds: true,
}).extend({
  messages: ExportedMessage.array(),
})

type ExportedChat = z.infer<typeof ExportedChat>

export const importChat = async (entity: unknown) => {
  const { data: exportedChat } = ExportedChat.safeParse(entity)

  if (!exportedChat) return []

  const messageIds: string[] = []

  for (const exportedMessage of exportedChat.messages) {
    const [message] = await importMessage(exportedMessage)

    if (message) {
      messageIds.push(message.id)
    }
  }

  if (_.isEmpty(messageIds)) {
    let emptyChatAlreadyExists = false

    // do not use chatstore
    await chatTable.iterate(chat => {
      if (_.isEmpty(chat.messageIds)) {
        emptyChatAlreadyExists = true
      }
    })

    if (emptyChatAlreadyExists) {
      // do not import and empty chat if one already exists
      return undefined
    }
  }

  const chat = await chatTable.create({
    ...exportedChat,
    messageIds,
  })

  return [chat]
}

export const exportChat = async (
  { messageIds, ...chat }: ChatModel,
  options: Record<string, unknown>,
): Promise<ExportedChat | undefined> => {
  // do not export empty chats
  if (_.isEmpty(messageIds)) {
    return undefined
  }

  const messageModels = await messageTable.findByIds(messageIds)
  const messages: ExportedMessage[] = []

  for (const messageModel of messageModels) {
    const message = await exportMessage(messageModel, options)

    messages.push(message)
  }

  return {
    ...chat,
    messages,
  }
}
