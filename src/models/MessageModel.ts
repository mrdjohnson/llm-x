import { types, Instance, getParentOfType, cast } from 'mobx-state-tree'

import CachedStorage from '~/utils/CachedStorage'
import { ChatModel } from '~/models/ChatModel'

const MessageErrorModel = types.model({
  message: types.string,
  stack: types.maybe(types.string),
})

const MessageExtrasModel = types.model({
  error: types.maybe(MessageErrorModel),
})

export const MessageModel = types
  .model({
    fromBot: types.boolean,
    // this should have been modelName
    botName: types.maybeNull(types.string),
    modelType: types.maybe(types.string),
    content: types.optional(types.string, ''),
    // deprecated
    image: types.maybe(types.string),
    uniqId: types.identifier,
    extras: types.maybe(MessageExtrasModel),
    imageUrls: types.array(types.string),
  })
  .views(self => ({
    get imageUrl() {
      return self.imageUrls[0]
    },

    isBlank() {
      return self.content || !this.imageUrl || !self.extras?.error
    },
  }))
  .actions(self => ({
    async afterAttach() {
      // migration from .image: large_image_data => .imageUrls: cached_image_url
      // deprecating field
      const image = self.image
      self.image = undefined
      if (image) {
        const chatId = getParentOfType(self, ChatModel)?.id

        await this.setImage(chatId, image)
      }
    },

    async beforeDestroy() {
      await this.clearImages()
    },

    _setImageUrls(imageUrls: string[]) {
      self.imageUrls = cast(imageUrls)
    },

    async clearImages() {
      const imageUrls = self.imageUrls

      this._setImageUrls([])

      for (const imageUrl of imageUrls) {
        await CachedStorage.delete(imageUrl)
      }
    },

    async setImage(parentId: number, imageData?: string) {
      if (!imageData) {
        await this.clearImages()
        return
      }

      const imageUrl = `/llm-x/${parentId}/${self.uniqId}/image-${self.imageUrls.length}.png`

      await CachedStorage.put(imageUrl, imageData)

      this._setImageUrls([imageUrl])
    },

    setError(error: Error) {
      self.extras ||= MessageExtrasModel.create()

      const { message, stack } = error

      self.extras.error = MessageErrorModel.create({ message, stack })
    },
  }))

export interface IMessageModel extends Instance<typeof MessageModel> {}
