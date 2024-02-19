import _ from 'lodash'
import { types, Instance, cast } from 'mobx-state-tree'

export const MessageModel = types.model({
  fromBot: types.boolean,
  botName: types.maybe(types.string),
  content: types.optional(types.string, ''),
  uniqId: types.identifier,
})

export interface IMessageModel extends Instance<typeof MessageModel> {}

export const ChatModel = types
  .model({
    id: types.optional(types.identifierNumber, Date.now),
    name: types.optional(types.string, ''),
    messages: types.array(MessageModel),
    incomingMessage: types.maybe(MessageModel),
  })
  .actions(self => ({
    afterCreate() {
      if (self.incomingMessage) {
        this.commitIncomingMessage()
      }
    },

    setName(name?: string) {
      if (name) {
        self.name = name
      }
    },

    deleteMessage(uniqId: string) {
      const messagesWithoutMessage = _.reject(self.messages, { uniqId })

      self.messages = cast(messagesWithoutMessage)
    },

    createIncomingMessage(botName: string) {
      const uniqId = 'bot_' + Date.now()

      self.incomingMessage = MessageModel.create({ fromBot: true, botName, uniqId })

      return self.incomingMessage
    },

    commitIncomingMessage() {
      if (self.incomingMessage) {
        const message = self.incomingMessage

        self.incomingMessage = undefined
        self.messages.push(message)
      }
    },

    updateIncomingMessage(content: string) {
      self.incomingMessage!.content += content
    },

    addUserMessage(content: string) {
      if (_.isEmpty(self.messages)) {
        this.setName(content.substring(0, 20))
      }

      const message = MessageModel.create({
        fromBot: false,
        content,
        uniqId: 'user_' + Date.now(),
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
