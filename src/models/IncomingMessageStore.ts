import _ from 'lodash'
import { types } from 'mobx-state-tree'

import { IMessageModel, MessageModel } from '~/models/MessageModel'
import { settingStore } from '~/models/SettingStore'
import { toastStore } from '~/models/ToastStore'
import { IChatModel } from '~/models/ChatModel'

import { OllamaApi } from '~/utils/OllamaApi'
import { A1111Api } from '~/utils/A1111Api'
import { LmsApi } from '~/utils/LmsApi'

const IncomingMessageAbortedModel = types.model({
  id: types.identifier,
  abortedManually: types.maybe(types.boolean),
})

export const IncomingMessageStore = types
  .model({
    messageById: types.map(types.reference(MessageModel)),
    messageAbortedById: types.map(IncomingMessageAbortedModel),
  })
  .views(self => ({
    contains(message: IMessageModel): boolean {
      return !!self.messageById.get(message.uniqId)
    },

    get isGettingData() {
      return !_.isEmpty(self.messageById)
    },
  }))
  .actions(self => ({
    async beforeDestroy() {
      OllamaApi.cancelStream()
      LmsApi.cancelStream()
    },

    deleteMessage(message: IMessageModel) {
      this.commitMessage(message)

      message.selfDestruct()
    },

    commitMessage(message: IMessageModel) {
      self.messageById.delete(message.uniqId)
      self.messageAbortedById.delete(message.uniqId)
    },

    abortGeneration(message?: IMessageModel) {
      if (message) {
        const id = message.uniqId

        self.messageAbortedById.put({ id, abortedManually: true })

        // error prone by quick switching during generation
        if (settingStore.modelType === 'A1111') {
          A1111Api.cancelStream(id)
        } else if (settingStore.modelType === 'LMS') {
          LmsApi.cancelStream(id)
        } else {
          OllamaApi.cancelStream(id)
        }

        return
      }

      for (const message of self.messageById.keys()) {
        self.messageAbortedById.put({ id: message, abortedManually: true })
      }

      // error prone by quick switching during generation
      if (settingStore.modelType === 'A1111') {
        A1111Api.cancelStream()
      } else if (settingStore.modelType === 'LMS') {
        LmsApi.cancelStream()
      } else {
        OllamaApi.cancelStream()
      }
    },

    async generateImage(chat: IChatModel, incomingMessage: IMessageModel) {
      const incomingIndex = _.findIndex(chat.messages, { uniqId: incomingMessage.uniqId })
      const prompt = _.findLast(chat.messages, { fromBot: false }, incomingIndex)?.content

      if (!prompt) {
        if (incomingMessage.isBlank()) {
          this.deleteMessage(incomingMessage)
        } else {
          this.commitMessage(incomingMessage)
        }

        toastStore.addToast('no prompt found to regenerate image from', 'error')

        return
      }

      const messageToEdit = incomingMessage.selectedVariation

      messageToEdit.setModelName(settingStore.selectedModelLabel)

      console.log(prompt)

      await this.handleIncomingMessage(incomingMessage, async () => {
        const images = await A1111Api.generateImage(prompt, messageToEdit)

        await messageToEdit.addImages(
          chat.id,
          images.map(image => 'data:image/png;base64,' + image),
        )
      })
    },

    async generateVariation(chat: IChatModel, incomingMessage: IMessageModel) {
      if (!incomingMessage.isBlank()) {
        const variation = chat.createIncomingMessage()

        incomingMessage.addVariation(variation)
      }

      return this.generateMessage(chat, incomingMessage)
    },

    async generateMessage(chat: IChatModel, incomingMessage: IMessageModel) {
      const messageToEdit = incomingMessage.selectedVariation

      self.messageById.put(messageToEdit)

      if (settingStore.modelType === 'A1111') {
        return this.generateImage(chat, incomingMessage)
      }

      let streamChat: typeof OllamaApi.streamChat

      if (settingStore.modelType === 'LMS') {
        streamChat = LmsApi.streamChat
      } else {
        streamChat = OllamaApi.streamChat
      }

      messageToEdit.setModelName(settingStore.selectedModelLabel)

      await this.handleIncomingMessage(incomingMessage, async () => {
        for await (const contentChunk of streamChat(
          chat.messages,
          incomingMessage,
          messageToEdit,
        )) {
          messageToEdit.addContent(contentChunk)
        }
      })
    },

    async handleIncomingMessage(incomingMessage: IMessageModel, callback: () => Promise<void>) {
      let shouldDeleteMessage = false

      const messageToEdit = incomingMessage.selectedVariation

      try {
        await callback()
      } catch (error: unknown) {
        if (self.messageAbortedById.get(messageToEdit.uniqId)) {
          messageToEdit.setError(new Error('Stream stopped by user'))

          shouldDeleteMessage = _.isEmpty(messageToEdit.content)
        } else if (error instanceof Error) {
          messageToEdit.setError(error)

          // make sure the server is still connected
          settingStore.fetchOllamaModels()
        }
      } finally {
        if (shouldDeleteMessage) {
          this.deleteMessage(messageToEdit)
        } else {
          this.commitMessage(messageToEdit)
        }
      }
    },
  }))

export const incomingMessageStore = IncomingMessageStore.create()
