import { cast, types } from 'mobx-state-tree'
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
      const chats = _.reject(self.chats, { id: chat.id })

      if (self.selectedChat?.id === chat.id) {
        self.selectedChat = chats[0]
      }

      self.chats = cast(chats)

      if (chats.length === 0) {
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
  }))

export const chatStore = ChatStore.create()

persist('chat-store', chatStore)
