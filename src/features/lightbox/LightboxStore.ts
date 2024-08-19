import _ from 'lodash'
import { makeAutoObservable } from 'mobx'
import { type Slide } from 'yet-another-react-lightbox'

import { MessageViewModel } from '~/core/message/MessageViewModel'
import { chatStore } from '~/core/chat/ChatStore'

class LightboxStore {
  messageId?: string
  imageUrl?: string

  constructor() {
    makeAutoObservable(this)
  }

  get chat() {
    return chatStore.selectedChat
  }

  get lightboxMessage(): MessageViewModel | undefined {
    if (!this.chat) return undefined

    return _.find(this.chat.messages, { id: this.messageId })
  }

  get lightboxSlides() {
    if (!this.lightboxMessage) return []

    const lightBoxSources: Array<Slide & { baseId: string }> = []

    let userPrompt: string | undefined

    this.chat!.messages.forEach(baseMessage => {
      const { source: message } = baseMessage.selectedVariation

      if (message.fromBot === false) {
        userPrompt = message.content
      }

      message.imageUrls.forEach((imageUrl, index) => {
        lightBoxSources.push({
          description: userPrompt + ` (${index + 1}/${message.imageUrls.length})`,
          src: imageUrl,
          baseId: baseMessage.id,
        })
      })
    })

    return lightBoxSources
  }

  get imageUrlIndex() {
    if (!this.imageUrl) return -1

    return _.findIndex(this.lightboxSlides, { src: this.imageUrl })
  }

  setLightboxMessageById(baseUniqId: string, imageUrl: string) {
    this.messageId = baseUniqId
    this.imageUrl = imageUrl
  }

  closeLightbox() {
    this.messageId = undefined
    this.imageUrl = undefined
  }
}

export const lightboxStore = new LightboxStore()
