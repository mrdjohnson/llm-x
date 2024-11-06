import _, { DebouncedFunc } from 'lodash'
import { makeAutoObservable, runInAction } from 'mobx'

import { MessageErrorModel, MessageExtrasModel, MessageModel } from '~/core/message/MessageModel'
import { messageTable } from '~/core/message/MessageTable'
import { SelectedVariationHandler } from '~/core/message/SelectedVariationHandler'

import EntityCache from '~/utils/EntityCache'
import { formatMessageDetails } from '~/utils/formatMessageDetails'
import { addImageToCachedStorage } from '~/utils/addImageToCachedStorage'

export class MessageViewModel {
  contentOverride = ''

  variationViewModelCache = new EntityCache<MessageModel, MessageViewModel>(
    message => new MessageViewModel(message, this),
  )

  selectedVariationHandler: SelectedVariationHandler

  showVariations: boolean = false

  constructor(
    public source: MessageModel,
    public _rootMessage?: MessageViewModel,
  ) {
    makeAutoObservable(this)

    this.selectedVariationHandler = new SelectedVariationHandler(
      source,
      this,
      this.variationViewModelCache,
    )

    this.fetchVariations()
  }

  setShowVariations(showVariations: boolean) {
    this.showVariations = showVariations
  }

  get id() {
    return this.source.id
  }

  get variations(): MessageViewModel[] {
    return this.selectedVariationHandler.variations
  }

  get selectedVariation(): MessageViewModel {
    return this.selectedVariationHandler.selectedVariation || this
  }

  get content() {
    return this.contentOverride || this.source?.content
  }

  get rootMessage(): MessageViewModel {
    return this._rootMessage || this
  }

  fetchVariations() {
    messageTable.findByIds(this.source.variationIds).then(loadedVariations => {
      loadedVariations.forEach(message => this.variationViewModelCache.put(message))
    })
  }

  isBlank() {
    if (!this.source) return true

    return _.isEmpty(this.content || this.source.imageUrls || this.source.extras?.error)
  }

  updateContent(content: string) {
    this.contentOverride += content

    this.slowUpdate(this.contentOverride)
  }

  update = (data: Partial<MessageModel>) => {
    this.slowUpdate.cancel
    return messageTable.put({ ...this.source, ...data })
  }

  slowUpdate: DebouncedFunc<(content: string) => Promise<void>> = _.throttle(
    async (content: string) => {
      await runInAction(() => {
        return messageTable.put({ ...this.source, content })
      })
    },
    3000,
  )

  setError(errorData: Error) {
    const error = MessageErrorModel.safeParse(errorData)

    const extras = MessageExtrasModel.safeParse({ ...this.source.extras, error })

    this.update({ extras })
  }

  async setExtraDetails(detailObject?: Record<string, unknown>) {
    const details = formatMessageDetails(detailObject)
    const extras = MessageExtrasModel.safeParse({ ...this.source.extras, details })

    await this.update({ extras })
  }

  async setVariation(variation?: MessageViewModel) {
    return await messageTable.put({ ...this.source, selectedVariationId: variation?.id })
  }

  async removeVariation(variation: MessageViewModel) {
    const variationIds = _.without(this.source.variationIds, variation.id)

    let selectedVariationId = this.source.selectedVariationId
    if (selectedVariationId === variation.id) {
      selectedVariationId = undefined
    }

    await messageTable.put({ ...this.source, selectedVariationId, variationIds })
    await messageTable.destroy(variation.source)

    this.variationViewModelCache.remove(variation.id)
  }

  async addVariation(variation: MessageModel) {
    const variationIds = this.source.variationIds.concat(variation.id)

    // add variation to cache
    const viewModel = this.variationViewModelCache.put(variation)

    // update message with variation id
    await messageTable.put({ ...this.source, selectedVariationId: variation.id, variationIds })

    return viewModel
  }

  async addImages(imageDatums?: string[]) {
    if (!imageDatums || _.isEmpty(imageDatums)) return

    const imageUrls = [...this.source.imageUrls]

    // add image to the cache, add the url to the list
    for (const imageData of imageDatums) {
      const imageUrl = await addImageToCachedStorage(this.id, { imageData })

      if (imageUrl) {
        imageUrls.push(imageUrl)
      }
    }

    // update image urls
    await this.update({ imageUrls })
  }

  async selectPreviousVariation() {
    return await this.setVariation(this.selectedVariationHandler.previousVariation)
  }

  async selectNextVariation() {
    console.log('selecting next variation: ', this.selectedVariationHandler.nextVariation?.id)
    return await this.setVariation(this.selectedVariationHandler.nextVariation)
  }
}
