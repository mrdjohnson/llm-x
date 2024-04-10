import _ from 'lodash'
import { types, Instance, cast, destroy, flow } from 'mobx-state-tree'
import moment from 'moment'
import { type Slide } from 'yet-another-react-lightbox'

import { IMessageModel, MessageModel } from '~/models/MessageModel'
import { settingStore } from '~/models/SettingStore'
import { toastStore } from '~/models/ToastStore'

import base64EncodeImage from '~/utils/base64EncodeImage'
import { OllmaApi } from '~/utils/OllamaApi'
import { A1111Api } from '~/utils/A1111Api'
import CachedStorage from '~/utils/CachedStorage'

export const ChatModel = types
  .model({
    id: types.optional(types.identifierNumber, Date.now),
    name: types.optional(types.string, ''),
    messages: types.array(MessageModel),
    _incomingMessageId: types.maybe(types.string), // bot message id
    _incomingMessageAbortedByUser: types.maybe(types.boolean),
    _messageToEditId: types.maybe(types.string), // user message to edit
    _lightboxMessageId: types.maybe(types.string),
    _lightboxImageUrl: types.maybe(types.string),
    _previewImageUrls: types.array(types.string),
  })
  .views(self => ({
    get incomingMessage() {
      if (!self._incomingMessageId) return

      return _.find(self.messages, { uniqId: self._incomingMessageId })
    },

    get messageToEdit() {
      if (!self._messageToEditId) return

      return _.find(self.messages, { uniqId: self._messageToEditId })
    },

    get isGettingData() {
      return !!this.incomingMessage
    },

    get isEditingMessage() {
      return !!this.messageToEdit
    },

    get lastMessageDate() {
      if (self.messages.length === 0) return moment()

      const lastMessage = _.last(self.messages)
      const sentTime = moment(parseInt(lastMessage!.uniqId.split('_')[1]))

      return sentTime
    },

    get lastMessageDateLabel() {
      const sentTime = this.lastMessageDate

      const today = moment().startOf('day')

      if (sentTime.isAfter(today)) {
        return 'Today'
      }

      if (sentTime.isAfter(today.subtract(1, 'days'))) {
        return 'Yesterday'
      }

      const thisWeek = moment().startOf('week')

      if (sentTime.isAfter(thisWeek)) {
        return 'This Week'
      }

      const thisMonth = moment().startOf('month')

      if (sentTime.isAfter(thisMonth.subtract(2, 'months'))) {
        // January February ...
        return sentTime.format('MMMM')
      }

      return 'Older'
    },

    get lightboxMessage() {
      return _.find(self.messages, { uniqId: self._lightboxMessageId })
    },

    get lightboxSlides() {
      if (!this.lightboxMessage) return []

      const lightBoxSources: Array<Slide & { uniqId: string }> = []

      let userPrompt: string | undefined

      self.messages.forEach(message => {
        if (message.fromBot === false) {
          userPrompt = message.content
        }

        message.imageUrls.forEach((imageUrl, index) => {
          lightBoxSources.push({
            description: userPrompt + ` (${index + 1}/${message.imageUrls.length})`,
            src: imageUrl,
            uniqId: message.uniqId,
          })
        })
      })

      return lightBoxSources
    },

    get lightboxImageUrlIndex() {
      if (!self._lightboxImageUrl) return -1
      return _.findIndex(this.lightboxSlides, ({ src }) => src === self._lightboxImageUrl)
    },

    get previewImageUrls() {
      return self._previewImageUrls
    },
  }))
  .actions(self => ({
    afterCreate() {
      if (self.incomingMessage) {
        this.commitIncomingMessage()
      }

      // do not persist the draft information
      this.removePreviewImageUrlsOnly()
      self._messageToEditId = undefined
      self._lightboxImageUrl = undefined
      self._lightboxMessageId = undefined
      self._incomingMessageAbortedByUser = undefined
      self._previewImageUrls = cast([])
    },

    async beforeDestroy() {
      OllmaApi.cancelStream()
    },

    setMessageToEdit(message?: IMessageModel) {
      // todo, does this clear out previews?
      self._messageToEditId = message?.uniqId
      self._previewImageUrls = cast(_.toArray(message?.imageUrls))
    },

    async commitMessageToEdit(content: string, imageUrls: string[] = []) {
      const messageToEdit = self.messageToEdit!

      messageToEdit.content = content

      const urlsToRemove = _.difference(messageToEdit.imageUrls, imageUrls)
      const nextImageUrls = _.difference(imageUrls, messageToEdit.imageUrls)

      // remove saved images
      await messageToEdit.removeImageUrls(urlsToRemove)

      // add preview images
      await messageToEdit.addImageUrls(self.id, nextImageUrls)
    },

    _setPreviewImageUrls(previewImageUrls: string[]) {
      self._previewImageUrls = cast(previewImageUrls)
    },

    clearImagePreviews() {
      this._setPreviewImageUrls([])
    },

    async removePreviewImageUrlsOnly() {
      for (const imageUrl of self.previewImageUrls) {
        if (imageUrl.includes('preview-image-')) {
          await CachedStorage.delete(imageUrl)
        }
      }

      this._setPreviewImageUrls([])
    },

    async removePreviewImageUrl(imageUrl: string) {
      await CachedStorage.delete(imageUrl)

      this._setPreviewImageUrls(_.without(self.previewImageUrls, imageUrl))
    },

    addPreviewImage: flow(function* addPreviewImage(file: File) {
      try {
        const previewUrl = `/llm-x/${_.uniqueId('preview-image-')}`
        const imageData = yield base64EncodeImage(file)

        yield CachedStorage.put(previewUrl, imageData)

        self.previewImageUrls.push(previewUrl)
      } catch (e) {
        toastStore.addToast(
          'Unable to read image, check the console for error information',
          'error',
        )

        console.error(e)
      }
    }),

    setLightboxMessageById(uniqId: string, imageUrl: string) {
      self._lightboxMessageId = uniqId
      self._lightboxImageUrl = imageUrl
    },

    closeLightbox() {
      self._lightboxMessageId = undefined
      self._lightboxImageUrl = undefined
    },

    setName(name?: string) {
      if (name) {
        self.name = name
      }
    },

    deleteMessage(message: IMessageModel) {
      destroy(message)
    },

    findAndRegenerateResponse() {
      const messageToEditIndex = _.indexOf(self.messages, self.messageToEdit)
      const messageAfterEditedMessage: IMessageModel = self.messages[messageToEditIndex + 1]

      let botMessageToEdit: IMessageModel

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

      self._messageToEditId = undefined
      this.generateMessage(botMessageToEdit)
    },

    findAndEditPreviousMessage() {
      // this goes in a loop, letting it happen though.
      const currentIndex = self.messageToEdit
        ? _.indexOf(self.messages, self.messageToEdit)
        : self.messages.length

      const messageToEdit = _.findLast(self.messages, { fromBot: false }, currentIndex - 1)

      this.setMessageToEdit(messageToEdit)
    },

    findAndEditNextMessage() {
      const currentIndex = self.messageToEdit
        ? _.indexOf(self.messages, self.messageToEdit)
        : self.messages.length

      const messageToEdit = _.find(self.messages, { fromBot: false }, currentIndex + 1)

      this.setMessageToEdit(messageToEdit)
    },

    createIncomingMessage() {
      const uniqId = 'bot_' + Date.now()

      const incomingMessage = MessageModel.create({
        fromBot: true,
        botName: settingStore.selectedModelLabel,
        modelType: settingStore.selectedModelType,
        uniqId,
        content: '',
      })

      return incomingMessage
    },

    createAndPushIncomingMessage() {
      const incomingMessage: IMessageModel = this.createIncomingMessage()

      self.messages.push(incomingMessage)

      self._incomingMessageId = incomingMessage.uniqId

      return incomingMessage
    },

    commitIncomingMessage() {
      self._incomingMessageId = undefined
      self._incomingMessageAbortedByUser = false
    },

    updateIncomingMessage(content: string) {
      self.incomingMessage!.content += content
    },

    abortGeneration() {
      self._incomingMessageAbortedByUser = true

      // error prone by quick switching during generation
      if (settingStore.isImageGenerationMode) {
        A1111Api.cancelGeneration()
      } else {
        OllmaApi.cancelStream()
      }
    },

    async generateImage(incomingMessage: IMessageModel) {
      self._incomingMessageId = incomingMessage.uniqId

      const incomingIndex = _.findIndex(self.messages, { uniqId: incomingMessage.uniqId })
      const prompt = _.findLast(self.messages, { fromBot: false }, incomingIndex)?.content

      if (!prompt) {
        if (!incomingMessage.isBlank()) {
          this.commitIncomingMessage()
        } else {
          this.deleteMessage(incomingMessage)
        }

        toastStore.addToast('no prompt found to regenerate image from', 'error')

        return
      }

      await incomingMessage.clearImages()

      if (incomingMessage.extras) {
        incomingMessage.extras.error = undefined
      }

      console.log(prompt)

      try {
        const images = await A1111Api.generateImage(prompt)

        await incomingMessage.addImages(
          self.id,
          images.map(image => 'data:image/png;base64,' + image),
        )
      } catch (error: unknown) {
        if (self._incomingMessageAbortedByUser) {
          incomingMessage.setError(new Error('Stream stopped by user'))

          if (_.isEmpty(incomingMessage.content)) {
            this.deleteMessage(incomingMessage)
          }
        } else if (error instanceof Error) {
          incomingMessage.setError(error)

          // make sure the server is still connected
          settingStore.updateModels()
        }
      } finally {
        this.commitIncomingMessage()
      }
    },

    async generateMessage(incomingMessage: IMessageModel) {
      self._incomingMessageId = incomingMessage.uniqId
      incomingMessage.content = ''

      if (incomingMessage.extras) {
        incomingMessage.extras.error = undefined
      }

      if (settingStore.isImageGenerationMode) {
        return this.generateImage(incomingMessage)
      }

      try {
        for await (const message of OllmaApi.streamChat(self.messages, incomingMessage)) {
          this.updateIncomingMessage(message)
        }
      } catch (error: unknown) {
        if (self._incomingMessageAbortedByUser) {
          incomingMessage.setError(new Error('Stream stopped by user'))

          if (_.isEmpty(incomingMessage.content)) {
            this.deleteMessage(incomingMessage)
          }
        } else if (error instanceof Error) {
          incomingMessage.setError(error)

          // make sure the server is still connected
          settingStore.updateModels()
        }
      } finally {
        this.commitIncomingMessage()
      }
    },

    async addUserMessage(content: string = '', imageUrls?: string[]) {
      if (!content && _.isEmpty(imageUrls)) return

      if (!self.name) {
        this.setName(content.substring(0, 40))
      }

      const message = MessageModel.create({
        fromBot: false,
        content,
        uniqId: 'user_' + Date.now(),
      })

      self.messages.push(message)

      message.addImageUrls(self.id, imageUrls)
    },
  }))

export interface IChatModel extends Instance<typeof ChatModel> {}
