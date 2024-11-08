import _ from 'lodash'
import { makeAutoObservable } from 'mobx'

import { toastStore } from '~/core/ToastStore'

import BaseApi from '~/core/connection/api/BaseApi'
import { ChatViewModel } from '~/core/chat/ChatViewModel'
import { MessageViewModel } from '~/core/message/MessageViewModel'
import { connectionStore } from '~/core/connection/ConnectionStore'

export class IncomingMessageStore {
  messageById: Record<string, MessageViewModel> = {}
  messageAbortedById: Set<string> = new Set()

  constructor() {
    makeAutoObservable(this)
  }

  contains(message: MessageViewModel): boolean {
    return !!this.messageById[message.id]
  }

  get isGettingData() {
    return !_.isEmpty(this.messageById)
  }

  commitMessage(message: MessageViewModel) {
    _.unset(this.messageById, message.id)
    _.unset(this.messageAbortedById, message.id)
  }

  deleteMessage(chat: ChatViewModel, message: MessageViewModel) {
    this.commitMessage(message)

    chat.destroyMessage(message)
  }

  async abortGeneration(message?: MessageViewModel) {
    if (message) {
      const id = message.id

      this.messageAbortedById.add(id)

      await BaseApi.cancelGeneration(id)

      return
    }

    for (const messageId of _.keys(this.messageById)) {
      this.messageAbortedById.add(messageId)
    }

    await BaseApi.cancelGeneration()
  }

  async generateImage(chat: ChatViewModel, incomingMessage: MessageViewModel, api: BaseApi) {
    const incomingIndex = _.findIndex(
      chat.source.messageIds,
      id => id === incomingMessage.rootMessage.id,
    )

    const prompt = _.findLast(
      chat.messages,
      messageViewModel => messageViewModel.source.fromBot === false,
      incomingIndex,
    )?.content

    if (!prompt) {
      if (incomingMessage.isBlank()) {
        await chat.destroyMessage(incomingMessage)
      } else {
        this.commitMessage(incomingMessage)
      }

      toastStore.addToast('no prompt found to regenerate image from', 'error')

      return
    }

    const messageToEdit = incomingMessage.selectedVariation

    await messageToEdit.update({ botName: connectionStore.selectedModelName })

    console.log(prompt)

    await this.handleIncomingMessage(chat, incomingMessage, async () => {
      const images = await api.generateImages(prompt, messageToEdit)

      await messageToEdit.addImages(images.map(image => 'data:image/png;base64,' + image))
    })
  }

  async generateVariation(chat: ChatViewModel, incomingMessage: MessageViewModel) {
    let message = incomingMessage

    if (!incomingMessage.isBlank()) {
      const variation = await chat.createIncomingMessage()

      message = await incomingMessage.addVariation(variation)
    }

    return await this.generateMessage(chat, message)
  }

  async generateMessage(chat: ChatViewModel, incomingMessage: MessageViewModel) {
    this.messageById[incomingMessage.id] = incomingMessage

    const connection = connectionStore.selectedConnection

    if (!connection) throw 'Unknown server'

    if (connectionStore.isImageGenerationMode) {
      return this.generateImage(chat, incomingMessage, connection.api)
    }

    const api: BaseApi | undefined = connection.api

    await incomingMessage.update({ botName: connectionStore.selectedModelName! })

    await this.handleIncomingMessage(chat, incomingMessage, async () => {
      for await (const contentChunk of api.generateChat(chat.messages, incomingMessage)) {
        incomingMessage.updateContent(contentChunk)
      }
    })
  }

  async handleIncomingMessage(
    chat: ChatViewModel,
    incomingMessage: MessageViewModel,
    callback: () => Promise<void>,
  ) {
    let shouldDeleteMessage = false

    const messageToEdit = incomingMessage

    try {
      await callback()
    } catch (error: unknown) {
      if (this.messageAbortedById.has(messageToEdit.id)) {
        messageToEdit.setError(new Error('Stream stopped by user'))

        shouldDeleteMessage = _.isEmpty(messageToEdit.content)
      } else if (error instanceof Error) {
        await messageToEdit.setError(error)

        // make sure the server is still connected
        connectionStore.selectedConnection?.fetchLmModels()
      }
    } finally {
      if (shouldDeleteMessage) {
        this.deleteMessage(chat, messageToEdit)
      } else {
        this.commitMessage(messageToEdit)
      }
    }
  }
}

export const incomingMessageStore = new IncomingMessageStore()
