import _ from 'lodash'
import { makeAutoObservable } from 'mobx'

import { ChatModel } from '~/core/chat/ChatModel'
import { ChatViewModel } from '~/core/chat/ChatViewModel'
import { chatTable } from '~/core/chat/ChatTable'
import { settingStore } from '~/core/setting/SettingStore'
import { settingTable } from '~/core/setting/SettingTable'

import EntityCache from '~/utils/EntityCache'
import { chatToDateLabel } from '~/utils/chatToDateLabel'

class ChatStore {
  chatCache = new EntityCache<ChatModel, ChatViewModel>({
    transform: chat => new ChatViewModel(chat),
    schema: ChatModel,
  })

  constructor() {
    makeAutoObservable(this)
  }

  get chats() {
    return _.compact(chatTable.cache.allValues().map(this.chatCache.getOrPut))
  }

  get selectedChat() {
    const chat = chatTable.findCachedById(settingStore.setting.selectedChatId)

    if (chat) {
      return this.chatCache.getOrPut(chat)
    }

    return undefined
  }

  get emptyChat(): ChatViewModel | undefined {
    return _.find(this.chats, chat => chat.source.messageIds.length === 0)
  }

  get orderedChats() {
    return _.orderBy(this.chats, 'source.lastMessageTimestamp', 'desc') // newest sent message first
  }

  // todo, see if this is used in more than one place?
  get dateLabelToChatPairs() {
    // [['today', todayChats], ['yesterday', [yesterdayChats], [....], ['older', olderChats]]
    return _.chain(this.orderedChats)
      .groupBy(chatToDateLabel) // {today: todayChats, yesterday: yesterdayChats, ...., older: olderChats},
      .toPairs()
      .value()
  }

  async destroyChat(chat: ChatViewModel) {
    let nextSelectedChat: ChatModel | undefined = undefined

    if (this.selectedChat?.id === chat.id) {
      nextSelectedChat = _.without(chatStore.orderedChats, chat)[0]?.source
    }

    // if we deleted the selected chat, and there was nothing to replace it
    if (!nextSelectedChat) {
      nextSelectedChat = await chatTable.create({})
    }

    await settingTable.put({ selectedChatId: nextSelectedChat?.id })

    this.chatCache.remove(chat.id)

    return chatTable.destroy(chat.source)
  }

  async selectChat(chat: ChatViewModel) {
    return settingTable.put({ selectedChatId: chat.id })
  }
}

export const chatStore = new ChatStore()
