import _ from 'lodash'
import { SnapshotOut, getSnapshot, SnapshotIn } from 'mobx-state-tree'

import { IChatModel } from '~/core/ChatModel'
import { chatStore, IChatStore } from '~/core/ChatStore'
import { ChatSnapshotHandler, FormattedChatSnapshot } from '~/utils/transfer/ChatSnapshotHandler'
import { DownloadOptions } from '~/utils/transfer/TransferHandler'

type FormattedChatStore = Omit<SnapshotOut<IChatStore>, 'chats'> & {
  chats: FormattedChatSnapshot[]
}

export class ChatStoreSnapshotHandler {
  static async formatChatStoreToExport(options: DownloadOptions = {}): Promise<FormattedChatStore> {
    const snapshot: SnapshotOut<IChatStore> = _.cloneDeep(getSnapshot(chatStore))

    const formattedChats = []

    for (const chat of snapshot.chats) {
      formattedChats.push(await ChatSnapshotHandler.formatChatSnapshotToExport(chat, options))
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
