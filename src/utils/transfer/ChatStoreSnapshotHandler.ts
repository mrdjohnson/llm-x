import _ from 'lodash'
import { SnapshotOut, getSnapshot, SnapshotIn } from 'mobx-state-tree'

import { IChatModel } from '~/models/ChatModel'
import { chatStore, IChatStore } from '~/models/ChatStore'
import { ChatSnapshotHandler, FormattedChatSnapshot } from '~/utils/transfer/ChatSnapshotHandler'

type FormattedChatStore = Omit<SnapshotOut<IChatStore>, 'chats'> & {
  chats: FormattedChatSnapshot[]
}

export class ChatStoreSnapshotHandler {
  static async formatChatStoreToExport(): Promise<FormattedChatStore> {
    const snapshot: SnapshotOut<IChatStore> = _.cloneDeep(getSnapshot(chatStore))

    const formattedChats = []

    for (const chat of snapshot.chats) {
      formattedChats.push(await ChatSnapshotHandler.formatChatSnapshotToExport(chat))
    }

    return {
      ...snapshot,
      chats: formattedChats,
    }
  }

  static async formatChatStoreToImport(
    data?: SnapshotIn<FormattedChatStore>,
  ): Promise<SnapshotIn<IChatStore> | null> {
    if (!data) return null

    const formattedChats: IChatModel[] = []
    let chatId = 0

    for (const chat of data.chats) {
      formattedChats.push(await ChatSnapshotHandler.formatChatToImport(chat, chatId))

      chatId++
    }

    return {
      ...data,
      chats: formattedChats,
    }
  }
}
