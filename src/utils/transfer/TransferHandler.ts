import { applySnapshot } from 'mobx-state-tree'
import _ from 'lodash'

import { chatStore } from '~/models/ChatStore'
import { toastStore } from '~/models/ToastStore'
import { personaStore } from '~/models/PersonaStore'
import { settingStore } from '~/models/SettingStore'

import { ChatSnapshotHandler } from '~/utils/transfer/ChatSnapshotHandler'
import { ChatStoreSnapshotHandler } from '~/utils/transfer/ChatStoreSnapshotHandler'
import { connectionModelStore } from '~/features/connections/ConnectionModelStore'

export type DownloadOptions = {
  includeImages?: boolean
}

export class TransferHandler {
  static async handleImport(files?: FileList | File[] | null) {
    if (!files) return

    for (const file of files) {
      if (!file) {
        continue
      }

      if (file.type.startsWith('image/')) {
        await chatStore.selectedChat?.addPreviewImage(file)
        continue
      }

      try {
        const data = JSON.parse(await file.text())

        if (data.messages) {
          const chat = await ChatSnapshotHandler.formatChatToImport(data)

          chatStore.importChat(chat)
        } else {
          const importedChatStore = await ChatStoreSnapshotHandler.formatChatStoreToImport(
            data.chatStore,
          )

          if (importedChatStore) {
            importedChatStore.selectedChat = _.last(importedChatStore?.chats)?.id
          }

          applySnapshot(chatStore, importedChatStore)
          applySnapshot(personaStore, data.personaStore)
          applySnapshot(settingStore, data.settingStore)
          applySnapshot(connectionModelStore.dataStore, data.connectionStore)

          connectionModelStore.refreshModels()
        }
      } catch (e) {
        toastStore.addToast('Unable to read file, check the console for error information', 'error')
        console.error(e)
      }
    }
  }
}
