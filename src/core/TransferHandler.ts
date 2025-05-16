import { toastStore } from '~/core/ToastStore'

import { settingStore } from '~/core/setting/SettingStore'
import { chatStore } from '~/core/chat/ChatStore'
import { connectionStore } from '~/core/connection/ConnectionStore'

import { DATABASE_TABLES } from '~/core/db'
import { chatTable } from '~/core/chat/ChatTable'
import { settingTable } from '~/core/setting/SettingTable'
import { connectionTable } from '~/core/connection/ConnectionTable'
import { personaTable } from '~/core/persona/PersonaTable'

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
        await chatStore.selectedChat?.previewImageHandler.addPreviewImage(file)
        continue
      }

      try {
        const data = JSON.parse(await file.text())

        // post localforage export
        if (data.databaseTimestamp) {
          if (data._chat) {
            await chatTable.import(data._chat)
          } else {
            for (const table of DATABASE_TABLES) {
              if (table.hasParentExportTable) continue

              await table.importAll(data[table.getTableName()])
            }
          }
          // legacy files
        } else if (data.messages) {
          const legacyChat = await chatTable.importFromLegacy(data)

          if (legacyChat?.length === 1) {
            await settingStore.update({ selectedChatId: legacyChat[0].id })
          }
        } else {
          await settingTable.importFromLegacy(data.settingStore)
          await chatTable.importFromLegacy(data.chatStore)
          await connectionTable.importFromLegacy(data.connectionStore)
          await personaTable.importFromLegacy(data.personaStore)

          connectionStore.refreshModels()
        }
      } catch (e) {
        toastStore.addToast('Unable to read file', 'error', e)
        console.error(e)
      }
    }
  }
}
