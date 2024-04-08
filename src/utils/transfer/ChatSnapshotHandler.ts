import _ from 'lodash'
import { SnapshotOut, getSnapshot, SnapshotIn } from 'mobx-state-tree'

import { ChatModel, IChatModel } from '~/models/ChatModel'
import { IMessageModel, MessageModel } from '~/models/MessageModel'
import CachedStorage from '~/utils/CachedStorage'

export type FormattedMessageSnpashot = Omit<SnapshotOut<IMessageModel>, 'imageUrls'> & {
  images: string[]
}

export type FormattedChatSnapshot = Omit<SnapshotOut<IChatModel>, 'messages'> & {
  messages: FormattedMessageSnpashot[]
}

export class ChatSnapshotHandler {
  static async formatChatToExport(chat: IChatModel): Promise<FormattedChatSnapshot> {
    const snapshot: SnapshotOut<IChatModel> = _.cloneDeep(getSnapshot(chat))

    return ChatSnapshotHandler.formatChatSnapshotToExport(snapshot)
  }

  static async formatChatSnapshotToExport(
    snapshot: SnapshotOut<IChatModel>,
  ): Promise<FormattedChatSnapshot> {
    const formmattedMessages = []

    for (const { imageUrls, ...message } of snapshot.messages) {
      const images: string[] = []

      for (const imageUrl of imageUrls) {
        const imageData = await CachedStorage.get(imageUrl)

        if (imageData) {
          images.push(imageData)
        }
      }

      formmattedMessages.push({
        ...message,
        images,
      })
    }

    const formattedChat: FormattedChatSnapshot = {
      ...snapshot,
      messages: formmattedMessages,
    }

    return formattedChat
  }

  static async formatChatToImport(data: FormattedChatSnapshot, id?: number): Promise<IChatModel> {
    const chatId = id ?? Date.now()

    const formattedMessages: IMessageModel[] = []

    if (data.messages) {
      for (const { images, ...message } of data.messages) {
        const formattedMessage = MessageModel.create(message)

        await formattedMessage.addImages(chatId, images)

        formattedMessages.push(formattedMessage)
      }
    }

    const chat: SnapshotIn<IChatModel> = {
      ...data,
      messages: formattedMessages,
    }

    return ChatModel.create({
      ...chat,
      id: chatId,
    })
  }
}
