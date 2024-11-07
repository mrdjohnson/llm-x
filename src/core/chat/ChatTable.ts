import _ from 'lodash'

import { importLegacyChatItem } from '~/core/chat/importLegacyChat'

import { BaseTable } from '~/core/BaseTable'
import { ChatModel } from '~/core/chat/ChatModel'
import { messageTable } from '~/core/message/MessageTable'
import { settingTable } from '~/core/setting/SettingTable'
import { exportChat, importChat } from '~/core/chat/chatTransfer'

export const ChatTableName = 'Chat' as const

export class ChatTable extends BaseTable<typeof ChatModel> {
  schema = ChatModel
  localStorageLocation = 'chat-store'

  getModel() {
    return ChatModel
  }

  getTableName() {
    return ChatTableName
  }

  async importFromLegacy(data: unknown) {
    if (!data) return

    return importLegacyChatItem(data)
  }

  async toSnapshot(chat: ChatModel) {
    const messages = await messageTable.findByIds(chat.messageIds)

    const json = _.omit(chat, 'messageIds')

    return { ...json, messages: _.compact(messages) }
  }

  async create(chat: Partial<ChatModel>) {
    const result = await super.create(chat)

    await settingTable.put({ selectedChatId: result.id })

    return result
  }

  // should be called from chatStore
  async destroy(chat: ChatModel) {
    const result = await super.destroy(chat)

    // remove all connected messages
    await messageTable.destroyMany(chat.messageIds)

    return result
  }

  async clearCacheAndPreload() {
    await super.clearCacheAndPreload()

    const size = await this.database.length()

    if (size === 0) {
      const defaultChat = await this.create({})

      await settingTable.put({ selectedChatId: defaultChat.id })
    }

    // pre-load all the chats
    await this.all()
  }

  async export(chat: ChatModel, options: Record<string, unknown> = {}) {
    return exportChat(chat, options)
  }

  async import(data: unknown) {
    importChat(data)
  }
}

export const chatTable = new ChatTable()
