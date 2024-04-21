import { types, Instance, getParentOfType, cast } from 'mobx-state-tree'
import _ from 'lodash'

import CachedStorage from '~/utils/CachedStorage'
import { ChatModel } from '~/models/ChatModel'

const MessageErrorModel = types.model({
  message: types.string,
  stack: types.maybe(types.string),
})

const MessageExtrasModel = types
  .model({
    error: types.maybe(MessageErrorModel),
    detailString: types.maybe(types.string),
  })
  .views(self => ({
    get details(): Record<string, number | string> | undefined {
      if (self.detailString) {
        const details = JSON.parse(self.detailString)

        return _.mapValues(details, (value, key) => {
          if (key.includes('duration') && _.isNumber(value)) {
            const milliseconds = Math.round(value / 10000) / 100

            if (_.isNil(milliseconds)) return 'N/A'

            return milliseconds + ' ms'
          }

          return value
        })
      }

      return undefined
    },
  }))

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
    isBlank() {
      return self.content || _.isEmpty(self.imageUrls) || !self.extras?.error
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

        await this.addImages(chatId, [image])
      }
    },

    async beforeDestroy() {
      await this.clearImages()
    },

    selfDestruct() {
      getParentOfType(self, ChatModel)?.deleteMessageById(self.uniqId)
    },

    async reset() {
      self.content = ''

      if (self.extras) {
        self.extras.error = undefined
      }

      self.botName = ''

      await this.clearImages()
    },

    setModelName(modelName: string = 'unknown_bot_name') {
      self.botName = modelName
    },

    setExtraDetails(details: Record<string, unknown>) {
      // remove any empty values, stringify any non number/strings
      const formattedDetails: Record<string, number | string> = _.chain(details)
        .omitBy(_.isNil)
        .mapValues(value =>
          _.isNumber(value) || _.isString(value) ? value : JSON.stringify(value),
        )
        .value()

      if (!self.extras) {
        self.extras = MessageExtrasModel.create()
      }

      self.extras.detailString = JSON.stringify(formattedDetails)
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

    async removeImageUrls(imageUrls: string[]) {
      for (const imageUrl of _.toArray(imageUrls)) {
        await CachedStorage.delete(imageUrl)

        this._setImageUrls(_.without(self.imageUrls, imageUrl))
      }
    },

    async addImageUrls(parentId: number, imageUrls?: string[]) {
      if (!imageUrls || _.isEmpty(imageUrls)) return

      for (const imageUrl of _.toArray(imageUrls)) {
        const image = await CachedStorage.get(imageUrl)

        if (!image) continue

        await this.addImages(parentId, [image])

        await CachedStorage.delete(imageUrl)
      }
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

    addContent(content: string) {
      self.content += content
    },
  }))

export interface IMessageModel extends Instance<typeof MessageModel> {}
