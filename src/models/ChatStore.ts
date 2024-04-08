import { types, destroy, Instance } from 'mobx-state-tree'
import persist from 'mst-persist'
import _ from 'lodash'

import { ChatModel, IChatModel } from '~/models/ChatModel'

export const ChatStore = types
  .model({
    chats: types.optional(types.array(ChatModel), []),
    selectedChat: types.safeReference(ChatModel),
  })
  .views(self => ({
    get isGettingData() {
      return !!self.selectedChat?.isGettingData
    },

    get emptyChat(): IChatModel | undefined {
      return _.find(self.chats, chat => chat.messages.length === 0)
    },

    get orderedChats() {
      return _.orderBy(self.chats, 'lastMessageDate', 'desc') // newest sent message first
    },

    get dateLabelToChatPairs() {
      // [['today', todayChats], ['yesterday', [yesterdayChats], [....], ['older', olderChats]]
      return _.chain(this.orderedChats)
        .groupBy('lastMessageDateLabel') // {today: todayChats, yesterday: yesterdayChats, ...., older: olderChats},
        .toPairs()
        .value()
    },
  }))
  .actions(self => ({
    afterCreate() {
      if (self.chats.length === 0) {
        this.createChat()
      }
    },

    createChat() {
      const chat = ChatModel.create({ id: Date.now() })

      self.chats.push(chat)
      self.selectedChat = chat
    },

    deleteChat(chat: IChatModel) {
      if (self.selectedChat?.id === chat.id) {
        self.selectedChat = _.without(self.orderedChats, chat)[0]
      }

      if (!self.selectedChat) {
        this.createChat()
      }

      destroy(chat)
    },

    selectChat(chat: IChatModel) {
      self.selectedChat = chat
    },

    importChat(chat: IChatModel) {
      self.chats.push(chat)
      self.selectedChat = chat
    },
  }))

export interface IChatStore extends Instance<typeof ChatStore> {}

export const chatStore = ChatStore.create()

persist('chat-store', chatStore).then(() => {
  if (!chatStore.selectedChat) {
    if (chatStore.chats.length > 0) {
      chatStore.selectChat(chatStore.orderedChats[0])
    } else {
      chatStore.createChat()
    }
  }
})
