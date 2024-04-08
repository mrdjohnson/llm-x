import { types, Instance, getParentOfType, cast } from 'mobx-state-tree'
import _ from 'lodash'

import CachedStorage from '~/utils/CachedStorage'
import { ChatModel } from '~/models/ChatModel'

const MessageErrorModel = types.model({
  message: types.string,
  stack: types.maybe(types.string),
})

const MessageExtrasModel = types.model({
  error: types.maybe(MessageErrorModel),
})

// note: do not use types.refrence for MessageModel, the uniq id can be duplicated between different chats
// instead use the types.maybe(types.string) for the uniq id, and find it per chat if it exists
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

    _addImageUrl(imageUrl: string) {
      self.imageUrls.push(imageUrl)
    },

    async clearImages() {
      const imageUrls = [...self.imageUrls]

      this._setImageUrls([])

      for (const imageUrl of imageUrls) {
        await CachedStorage.delete(imageUrl)
      }
    },

    async setImage(parentId: number, imageData?: string) {
      await this.clearImages()

      if (!imageData) {
        return
      }

      await this.addImages(parentId, [imageData])
    },

    async addImages(parentId: number, imageDatums?: string[]) {
      if (!imageDatums || _.isEmpty(imageDatums)) return

      for (const imageDatum of imageDatums) {
        const imageName = _.uniqueId('image-')
        const imageUrl = `/llm-x/${parentId}/${self.uniqId}/${imageName}.png`

        await CachedStorage.put(imageUrl, imageDatum)

        this._addImageUrl(imageUrl)
      }
    },

    setError(error: Error) {
      self.extras ||= MessageExtrasModel.create()

      const { message, stack } = error

      self.extras.error = MessageErrorModel.create({ message, stack })
    },
  }))

export interface IMessageModel extends Instance<typeof MessageModel> {}
