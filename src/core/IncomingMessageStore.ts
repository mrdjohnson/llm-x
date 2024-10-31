import _ from 'lodash'
import { types } from 'mobx-state-tree'

import { IMessageModel, MessageModel } from '~/core/MessageModel'
import { toastStore } from '~/core/ToastStore'
import { IChatModel } from '~/core/ChatModel'

import BaseApi from '~/core/connections/api/BaseApi'
import { connectionModelStore } from '~/core/connections/ConnectionModelStore'

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
      BaseApi.cancelGeneration()
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

        BaseApi.cancelGeneration(id)

        return
      }

      for (const message of self.messageById.keys()) {
        self.messageAbortedById.put({ id: message, abortedManually: true })
      }

      BaseApi.cancelGeneration()
    },

    async generateImage(chat: IChatModel, incomingMessage: IMessageModel, api: BaseApi) {
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

      messageToEdit.setModelName(connectionModelStore.selectedModelName!)

      console.log(prompt)

      await this.handleIncomingMessage(incomingMessage, async () => {
        const images = await api.generateImages(prompt, messageToEdit)

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

      const connection = connectionModelStore.selectedConnection

      if (!connection) throw 'Unknown server'

      if (connectionModelStore.isImageGenerationMode) {
        return this.generateImage(chat, incomingMessage, connection.api)
      }

      const api: BaseApi | undefined = connection.api

      messageToEdit.setModelName(connectionModelStore.selectedModelName!)

      await this.handleIncomingMessage(incomingMessage, async () => {
        for await (const contentChunk of api.generateChat(
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
          connectionModelStore.selectedConnection?.fetchLmModels()
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
