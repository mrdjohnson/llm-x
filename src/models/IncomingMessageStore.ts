import _ from 'lodash'
import { types } from 'mobx-state-tree'

import { IMessageModel, MessageModel } from '~/models/MessageModel'
import { settingStore } from '~/models/SettingStore'
import { toastStore } from '~/models/ToastStore'
import { IChatModel } from '~/models/ChatModel'

import { OllmaApi } from '~/utils/OllamaApi'
import { A1111Api } from '~/utils/A1111Api'

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
      OllmaApi.cancelStream()
    },

    deleteMessage(message: IMessageModel) {
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
        if (settingStore.isImageGenerationMode) {
          A1111Api.cancelGeneration()
        } else {
          OllmaApi.cancelStream(id)
        }

        return
      }

      for (const message of self.messageById.keys()) {
        self.messageAbortedById.put({ id: message, abortedManually: true })
      }

      OllmaApi.cancelStream()
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

      await incomingMessage.clearImages()

      if (incomingMessage.extras) {
        incomingMessage.extras.error = undefined
      }

      incomingMessage.content = ''

      console.log(prompt)

      await this.handleIncomingMessage(incomingMessage, async () => {
        const images = await A1111Api.generateImage(prompt)

        await incomingMessage.addImages(
          chat.id,
          images.map(image => 'data:image/png;base64,' + image),
        )
      })
    },

    async generateMessage(chat: IChatModel, incomingMessage: IMessageModel) {
      self.messageById.put(incomingMessage)

      if (settingStore.isImageGenerationMode) {
        return this.generateImage(chat, incomingMessage)
      }

      self.messageById.put(incomingMessage)

      incomingMessage.content = ''

      if (incomingMessage.extras) {
        incomingMessage.extras.error = undefined
      }

      await this.handleIncomingMessage(incomingMessage, async () => {
        for await (const contentChunk of OllmaApi.streamChat(chat.messages, incomingMessage)) {
          incomingMessage.addContent(contentChunk)
        }
      })
    },

    async handleIncomingMessage(incomingMessage: IMessageModel, callback: () => Promise<void>) {
      let shouldDeleteMessage = false

      try {
        await callback()
      } catch (error: unknown) {
        if (self.messageAbortedById.get(incomingMessage.uniqId)) {
          incomingMessage.setError(new Error('Stream stopped by user'))

          shouldDeleteMessage = _.isEmpty(incomingMessage.content)
        } else if (error instanceof Error) {
          incomingMessage.setError(error)

          // make sure the server is still connected
          settingStore.updateModels()
        }
      } finally {
        if (shouldDeleteMessage) {
          this.deleteMessage(incomingMessage)
        } else {
          this.commitMessage(incomingMessage)
        }
      }
    },
  }))

export const incomingMessageStore = IncomingMessageStore.create()
