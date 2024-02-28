import _ from 'lodash'
import { types, Instance, detach, flow, cast } from 'mobx-state-tree'

import { IMessageModel, MessageModel } from './MessageModel'
import { settingStore } from './SettingStore'
import { toastStore } from './ToastStore'

import base64EncodeImage from '../utils/base64EncodeImage'
import { OllmaApi } from '../utils/OllamaApi'

export const ChatModel = types
  .model({
    id: types.optional(types.identifierNumber, Date.now),
    name: types.optional(types.string, ''),
    messages: types.array(MessageModel),
    incomingMessage: types.safeReference(MessageModel), // bot message
    _incomingMessageAbortedByUser: types.maybe(types.boolean),
    previewImage: types.maybe(types.string),
    messageToEdit: types.safeReference(MessageModel), // user message to edit
  })
  .actions(self => ({
    afterCreate() {
      if (self.incomingMessage) {
        this.commitIncomingMessage()
      }

      // do not persist the draft information
      self.previewImage = undefined
      self.messageToEdit = undefined
    },

    beforeDestroy() {
      OllmaApi.cancelStream()
    },

    setMessageToEdit(message?: IMessageModel) {
      self.messageToEdit = message
      self.previewImage = message?.image
    },

    commitMessageToEdit(content: string, image?: string) {
      const messageToEdit = self.messageToEdit!

      messageToEdit.content = content
      messageToEdit.image = image
    },

    setPreviewImage: flow(function* setFile(file?: File) {
      if (!file) {
        self.previewImage = undefined
        return
      }

      try {
        self.previewImage = yield base64EncodeImage(file)
      } catch (e) {
        toastStore.addToast(
          'Unable to read image, check the console for error information',
          'error',
        )

        console.error(e)
      }
    }),

    setName(name?: string) {
      if (name) {
        self.name = name
      }
    },

    deleteMessage(message: IMessageModel) {
      detach(message)

      _.remove(self.messages, message)
    },

    findAndRegenerateResponse() {
      const messageToEditIndex = _.indexOf(self.messages, self.messageToEdit)
      const messageAfterEditedMessage = self.messages[messageToEditIndex + 1]

      let botMessageToEdit

      // edited message was the last message
      if (!messageAfterEditedMessage) {
        botMessageToEdit = this.createAndPushIncomingMessage()
        // if the previous bot message was deleted
      } else if (!messageAfterEditedMessage.fromBot) {
        botMessageToEdit = this.createIncomingMessage()

        const preMessages = self.messages.slice(0, messageToEditIndex + 1)
        const postMessages = self.messages.slice(messageToEditIndex + 1)

        self.messages = cast([...preMessages, botMessageToEdit, ...postMessages])
      } else {
        botMessageToEdit = messageAfterEditedMessage
      }

      self.messageToEdit = undefined
      this.generateMessage(botMessageToEdit)
    },

    createIncomingMessage() {
      const uniqId = 'bot_' + Date.now()

      const incomingMessage = MessageModel.create({
        fromBot: true,
        botName: settingStore.selectedModel?.name,
        uniqId,
        content: '',
      })

      return incomingMessage
    },

    createAndPushIncomingMessage() {
      const incomingMessage = this.createIncomingMessage()

      self.messages.push(incomingMessage)

      self.incomingMessage = incomingMessage

      return self.incomingMessage
    },

    commitIncomingMessage() {
      self.incomingMessage = undefined
      self._incomingMessageAbortedByUser = false
    },

    updateIncomingMessage(content: string) {
      self.incomingMessage!.content += content
    },

    abortGeneration() {
      self._incomingMessageAbortedByUser = true

      OllmaApi.cancelStream()
    },

    async generateMessage(incomingMessage: IMessageModel) {
      self.incomingMessage = incomingMessage
      incomingMessage.content = ''

      if (incomingMessage.extras) {
        incomingMessage.extras.error = undefined
      }

      try {
        for await (const message of OllmaApi.streamChat(self.messages, incomingMessage)) {
          this.updateIncomingMessage(message)
        }
      } catch (error: unknown) {
        if (self._incomingMessageAbortedByUser) {
          incomingMessage.setError(new Error('Stream stopped by user'))
        } else if (error instanceof Error) {
          incomingMessage.setError(error)

          // make sure the server is still connected
          settingStore.updateModels()
        }
      } finally {
        this.commitIncomingMessage()
      }
    },

    addUserMessage(content: string = '', image?: string) {
      if (!content && !image) return

      if (!self.name) {
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

    get isEditingMessage() {
      return !!self.messageToEdit
    },
  }))

export interface IChatModel extends Instance<typeof ChatModel> {}
