import { types } from 'mobx-state-tree'
import persist from 'mst-persist'
import _ from 'lodash'

import { ChatModel, IChatModel } from './ChatModel'

export const ChatStore = types
  .model({
    chats: types.optional(types.array(ChatModel), []),
    selectedChat: types.safeReference(ChatModel),
  })
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
      _.remove(self.chats, { id: chat.id })

      if (self.selectedChat?.id === chat.id) {
        self.selectedChat = self.chats[0]
      }

      if (self.chats.length === 0) {
        this.createChat()
      }
    },

    selectChat(chat: IChatModel) {
      self.selectedChat = chat
    },
  }))
  .views(self => ({
    get isGettingData() {
      return !!self.selectedChat?.isGettingData
    },

    get hasEmptyChat() {
      return _.some(self.chats, chat => chat.messages.length === 0)
    },
  }))

export const chatStore = ChatStore.create()

persist('chat-store', chatStore)
