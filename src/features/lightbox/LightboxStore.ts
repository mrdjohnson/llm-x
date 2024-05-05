import _ from 'lodash'
import { types, Instance } from 'mobx-state-tree'
import { type Slide } from 'yet-another-react-lightbox'

import { IMessageModel } from '~/models/MessageModel'

import { chatStore } from '~/models/ChatStore'

export const LightboxStore = types
  .model({
    messageId: types.maybe(types.string),
    imageUrl: types.maybe(types.string),
  })
  .views(self => ({
    get chat() {
      return chatStore.selectedChat
    },

    get lightboxMessage(): IMessageModel | undefined {
      if (!this.chat) return undefined

      return _.find(this.chat.messages, { uniqId: self.messageId })
    },

    get lightboxSlides() {
      if (!this.lightboxMessage) return []

      const lightBoxSources: Array<Slide & { baseUniqId: string  }> = []

      let userPrompt: string | undefined

      this.chat!.messages.forEach(baseMessage => {
        const message = baseMessage.selectedVariation

        if (message.fromBot === false) {
          userPrompt = message.content
        }

        message.imageUrls.forEach((imageUrl, index) => {
          lightBoxSources.push({
            description: userPrompt + ` (${index + 1}/${message.imageUrls.length})`,
            src: imageUrl,
            baseUniqId: baseMessage.uniqId,
          })
        })
      })

      return lightBoxSources
    },

    get imageUrlIndex() {
      if (!self.imageUrl) return -1

      return _.findIndex(this.lightboxSlides, ({ src }) => src === self.imageUrl)
    },
  }))
  .actions(self => ({
    setLightboxMessageById(baseUniqId: string, imageUrl: string) {
      self.messageId = baseUniqId
      self.imageUrl = imageUrl
    },

    closeLightbox() {
      self.messageId = undefined
      self.imageUrl = undefined
    },
  }))

export interface ILightboxStore extends Instance<typeof LightboxStore> {}

export const lightboxStore = LightboxStore.create()
