import {
  types,
  Instance,
  getParentOfType,
  cast,
  IAnyModelType,
  destroy,
  hasParentOfType,
} from 'mobx-state-tree'
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
    variations: types.array(types.late((): IAnyModelType => MessageModel)),
    selectedVariationIndex: types.maybe(types.number),
    showVariations: types.maybe(types.boolean),
  })
  .views(self => ({
    isBlank() {
      return _.isEmpty(self.content || self.imageUrls || self.extras?.error)
    },

    get selectedVariation(): IMessageModel {
      return this.getVariation(self.selectedVariationIndex)
    },

    getVariation(index: number = 0): IMessageModel {
      return self.variations[index - 1] || self
    },

    get hasPreviousVariation() {
      return _.gt(self.selectedVariationIndex, 0)
    },

    get hasNextVariation() {
      return _.lt(self.selectedVariationIndex, self.variations.length)
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
      if (hasParentOfType(self, MessageModel)) {
        getParentOfType(self, MessageModel).removeVariation(cast(self))
      } else {
        getParentOfType(self, ChatModel)?.deleteMessageById(self.uniqId)
      }
    },

    setModelName(modelName: string = 'unknown_bot_name') {
      self.botName = modelName
    },

    setExtraDetails(details: object) {
      // remove any empty values, stringify any non number/strings
      const formattedDetails: object = _.chain(details)
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

    setShowVariations(showVariations: boolean) {
      self.showVariations = showVariations
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

    addVariation(variation: IMessageModel) {
      self.variations.push(variation)

      self.selectedVariationIndex ??= 0

      self.selectedVariationIndex = self.variations.length
    },

    selectPreviousVariation() {
      self.selectedVariationIndex! -= 1
    },

    selectNextVariation() {
      self.selectedVariationIndex! += 1
    },

    setVariationIndex(index: number = 0) {
      self.selectedVariationIndex = index
    },

    removeVariation(variation: IMessageModel) {
      const indexToRemove = _.findIndex(self.variations, variation)

      if (_.lt(indexToRemove, self.selectedVariationIndex)) {
        self.selectedVariationIndex! -= 1
      }

      self.variations = cast(_.without(self.variations, variation))
      if (_.isEmpty(self.variations)) {
        self.showVariations = false
      }

      destroy(variation)
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
