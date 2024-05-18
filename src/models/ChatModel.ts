import _ from 'lodash'
import { types, Instance, cast, destroy, flow } from 'mobx-state-tree'
import moment from 'moment'

import { IMessageModel, MessageModel } from '~/models/MessageModel'
import { settingStore } from '~/models/SettingStore'
import { toastStore } from '~/models/ToastStore'
import { incomingMessageStore } from '~/models/IncomingMessageStore'

import base64EncodeImage from '~/utils/base64EncodeImage'
import { OllamaApi } from '~/utils/OllamaApi'
import CachedStorage from '~/utils/CachedStorage'

export const ChatModel = types
  .model({
    id: types.optional(types.identifierNumber, Date.now),
    name: types.optional(types.string, ''),
    messages: types.array(MessageModel),
    _messageToEditId: types.maybe(types.string), // user message to edit
    _messageVariantToEditId: types.maybe(types.string),
    _previewImageUrls: types.array(types.string),
  })
  .views(self => ({
    get messageToEdit() {
      if (!self._messageToEditId) return

      return _.find(self.messages, { uniqId: self._messageToEditId })
    },

    get messageVariantToEdit(): IMessageModel | undefined {
      if (!this.messageToEdit || !self._messageVariantToEditId) return undefined

      if (this.messageToEdit.uniqId === self._messageVariantToEditId) return this.messageToEdit

      return _.find(this.messageToEdit?.variations, { uniqId: self._messageVariantToEditId })
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

    get previewImageUrls() {
      return self._previewImageUrls
    },
  }))
  .actions(self => ({
    afterCreate() {
      // do not persist the draft information
      this.removePreviewImageUrlsOnly()
      self._messageToEditId = undefined
      self._messageVariantToEditId = undefined
      self._previewImageUrls = cast([])
    },

    async beforeDestroy() {
      OllamaApi.cancelStream()
    },

    setMessageToEdit(message?: IMessageModel, messageVariant?: IMessageModel) {
      // todo, does this clear out previews?
      self._messageToEditId = message?.uniqId
      self._messageVariantToEditId = messageVariant?.uniqId || message?.selectedVariation?.uniqId
      self._previewImageUrls = cast(_.toArray(message?.selectedVariation?.imageUrls))
    },

    async commitMessageToEdit(content: string, imageUrls: string[] = []) {
      const messageToEdit = self.messageVariantToEdit!

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

    async removePreviewImageUrls(imageUrls: string[]) {
      // only destroy images for new messages
      if (!self.messageToEdit) {
        for (const imageUrl of imageUrls) {
          await CachedStorage.delete(imageUrl)
        }
      }

      this._setPreviewImageUrls(_.without(self.previewImageUrls, ...imageUrls))
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

    setName(name?: string) {
      if (name) {
        self.name = name
      }
    },

    deleteMessage(message: IMessageModel) {
      destroy(message)
    },

    deleteMessageById(uniqId: string) {
      const message = _.find(self.messages, { uniqId })

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
      incomingMessageStore.generateVariation(cast(self), botMessageToEdit)
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

      return incomingMessage
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
