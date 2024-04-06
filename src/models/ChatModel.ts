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
    incomingMessage: types.safeReference(MessageModel), // bot message
    _incomingMessageAbortedByUser: types.maybe(types.boolean),
    previewImage: types.maybe(types.string),
    messageToEdit: types.safeReference(MessageModel), // user message to edit
    _lightboxMessage: types.safeReference(MessageModel),
    _previewImageUrl: types.maybe(types.string),
  })
  .actions(self => ({
    afterCreate() {
      if (self.incomingMessage) {
        this.commitIncomingMessage()
      }

      // do not persist the draft information
      self.previewImage = undefined
      self.messageToEdit = undefined
      self._lightboxMessage = undefined
      self._incomingMessageAbortedByUser = undefined
      self._previewImageUrl = undefined
    },

    async beforeDestroy() {
      OllmaApi.cancelStream()
    },

    setMessageToEdit(message?: IMessageModel) {
      self.messageToEdit = message
      self._previewImageUrl = message?.imageUrls[0]
    },

    commitMessageToEdit(content: string, image?: string) {
      const messageToEdit = self.messageToEdit!

      messageToEdit.content = content

      if (image) {
        messageToEdit.setImage(self.id, image)
      }
    },

    setPreviewImage: flow(function* setFile(file?: File) {
      if (!file) {
        if (self._previewImageUrl) {
          CachedStorage.delete(self._previewImageUrl)

          self._previewImageUrl = undefined
        }

        return
      }

      try {
        const previewUrl = `/llm-x/${_.uniqueId('preview-image-')}`
        const imageData = yield base64EncodeImage(file)

        yield CachedStorage.put(previewUrl, imageData)

        self._previewImageUrl = previewUrl
      } catch (e) {
        toastStore.addToast(
          'Unable to read image, check the console for error information',
          'error',
        )

        console.error(e)
      }
    }),

    setLightboxMessageById(uniqId: string) {
      self._lightboxMessage = _.find(self.messages, { uniqId })
    },

    closeLightbox() {
      self._lightboxMessage = undefined
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

      // error prone by quick switching during generation
      if (settingStore.isImageGenerationMode) {
        A1111Api.cancelGeneration()
      } else {
        OllmaApi.cancelStream()
      }
    },

    async generateImage(incomingMessage: IMessageModel) {
      self.incomingMessage = incomingMessage

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
        const image = await A1111Api.generateImage(prompt)

        await self.incomingMessage.setImage(self.id, 'data:image/png;base64,' + image)
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
      self.incomingMessage = incomingMessage
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

    addUserMessage(content: string = '', image?: string) {
      if (!content && !image) return

      if (!self.name) {
        this.setName(content.substring(0, 20))
      }

      const message = MessageModel.create({
        fromBot: false,
        content,
        uniqId: 'user_' + Date.now(),
      })

      self.messages.push(message)

      if (image) {
        message.setImage(self.id, image)
      }
    },
  }))
  .views(self => ({
    get isGettingData() {
      return !!self.incomingMessage
    },

    get isEditingMessage() {
      return !!self.messageToEdit
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
      return self._lightboxMessage
    },

    get lightboxSlides() {
      if (!self._lightboxMessage) return []

      const lightBoxSources: Array<Slide & { uniqId: string }> = []

      let userPrompt: string | undefined

      self.messages.forEach(message => {
        if (message.fromBot === false) {
          userPrompt = message.content
        }

        message.imageUrls.forEach(imageUrl => {
          lightBoxSources.push({
            description: userPrompt,
            src: imageUrl,
            uniqId: message.uniqId,
          })
        })
      })

      return lightBoxSources
    },

    get lightboxMessageIndex() {
      if (!self._lightboxMessage) return -1

      return _.findIndex(
        this.lightboxSlides,
        ({ uniqId }) => uniqId === self._lightboxMessage!.uniqId,
      )
    },

    get previewImageUrl() {
      return self._previewImageUrl
    },
  }))

export interface IChatModel extends Instance<typeof ChatModel> {}
