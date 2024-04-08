import { applySnapshot } from 'mobx-state-tree'

import { chatStore } from '~/models/ChatStore'
import { toastStore } from '~/models/ToastStore'
import { personaStore } from '~/models/PersonaStore'
import { settingStore } from '~/models/SettingStore'

import { ChatSnapshotHandler } from '~/utils/transfer/ChatSnapshotHandler'
import { ChatStoreSnapshotHandler } from '~/utils/transfer/ChatStoreSnapshotHandler'
import _ from 'lodash'

export class TransferHandler {
  static async handleImport(files?: FileList | File[] | null) {
    if (!files) return

    for (const file of files) {
      if (!file) {
        return
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
        }
      } catch (e) {
        toastStore.addToast('Unable to read file, check the console for error information', 'error')
        console.error(e)
      }
    }
  }
}
