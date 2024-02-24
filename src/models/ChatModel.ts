import _ from 'lodash'
import { types, Instance, cast } from 'mobx-state-tree'

import { settingStore } from './SettingStore'

import { OllmaApi } from '../utils/OllamaApi'
import { toastStore } from './ToastStore'

export const MessageModel = types.model({
  fromBot: types.boolean,
  botName: types.maybe(types.string),
  content: types.optional(types.string, ''),
  image: types.maybe(types.string),
  uniqId: types.identifier,
})

export interface IMessageModel extends Instance<typeof MessageModel> {}

export const ChatModel = types
  .model({
    id: types.optional(types.identifierNumber, Date.now),
    name: types.optional(types.string, ''),
    messages: types.array(MessageModel),
    incomingMessage: types.safeReference(MessageModel),
  })
  .actions(self => ({
    afterCreate() {
      if (self.incomingMessage) {
        this.commitIncomingMessage()
      }
    },

    beforeDestroy() {
      OllmaApi.cancelStream()
    },

    setName(name?: string) {
      if (name) {
        self.name = name
      }
    },

    async deleteMessage(uniqId: string) {
      const messagesWithoutMessage = _.reject(self.messages, { uniqId })

      self.messages = cast(messagesWithoutMessage)
    },

    createIncomingMessage() {
      const uniqId = 'bot_' + Date.now()

      const incomingMessage = MessageModel.create({
        fromBot: true,
        botName: settingStore.selectedModel?.name,
        uniqId,
      })

      self.messages.push(incomingMessage)

      self.incomingMessage = incomingMessage

      return self.incomingMessage
    },

    commitIncomingMessage() {
      self.incomingMessage = undefined
    },

    updateIncomingMessage(content: string) {
      self.incomingMessage!.content += content
    },

    abortGeneration() {
      OllmaApi.cancelStream()
    },

    async generateMessage(incomingMessage: IMessageModel) {
      self.incomingMessage = incomingMessage
      incomingMessage.content = ''

      try {
        for await (const message of OllmaApi.streamChat(self.messages, incomingMessage)) {
          this.updateIncomingMessage(message)
        }
      } catch (e) {
        // TODO: do not add this to the text but instead make it a boolean failed
        this.updateIncomingMessage('\n -- Communication stopped with server --')

        toastStore.addToast('Communication stopped with server', 'error')

        // make sure the server is still connected
        settingStore.updateModels()
      } finally {
        this.commitIncomingMessage()
      }
    },

    addUserMessage(content: string = '', image?: string) {
      if (!content && !image) return

      if (_.isEmpty(self.messages)) {
        this.setName(content.substring(0, 20))
      }

      const message = MessageModel.create({
        fromBot: false,
        content,
        uniqId: 'user_' + Date.now(),
        image,
      })

      self.messages.push(message)
    },
  }))
  .views(self => ({
    get isGettingData() {
      return !!self.incomingMessage
    },
  }))

export interface IChatModel extends Instance<typeof ChatModel> {}
