import _, { DebouncedFunc } from 'lodash'
import { makeAutoObservable, runInAction } from 'mobx'

import { MessageErrorModel, MessageExtrasModel, MessageModel } from '~/core/message/MessageModel'
import { messageTable } from '~/core/message/MessageTable'
import { SelectedVariationHandler } from '~/core/message/SelectedVariationHandler'

import EntityCache from '~/utils/EntityCache'
import { formatMessageDetails } from '~/utils/formatMessageDetails'
import { addImageToCachedStorage } from '~/utils/addImageToCachedStorage'
import { ActorViewModel } from '~/core/actor/ActorViewModel'
import { actorStore } from '~/core/actor/ActorStore'

export class MessageViewModel {
  contentOverride = ''

  variationViewModelCache = new EntityCache<MessageModel, MessageViewModel>({
    transform: message => new MessageViewModel(message, this),
  })

  selectedVariationHandler: SelectedVariationHandler

  showVariations: boolean = false

  // only used during creation
  private creationActor: ActorViewModel | undefined

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

  get actor() {
    return this.creationActor || actorStore.systemActor
  }

  fetchVariations() {
    messageTable.findByIds(this.source.variationIds).then(loadedVariations => {
      loadedVariations.forEach(message => this.variationViewModelCache.put(message))
    })
  }

  isBlank() {
    if (!this.source) return true

    return _.isEmpty(this.content || this.source.imageUrls[0] || this.source.extras?.error)
  }

  updateContent(content: string) {
    this.contentOverride += content

    this.slowUpdate(this.contentOverride)
  }

  update = (data: Partial<MessageModel>) => {
    this.slowUpdate.cancel?.()

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

  setCreationActor(actor: ActorViewModel) {
    this.creationActor = actor
  }

  unsetCreationActor() {
    this.creationActor = undefined
  }

  async setError(errorData: Error) {
    const { data: error } = MessageErrorModel.safeParse(errorData)

    const { data: extras } = MessageExtrasModel.safeParse({ ...this.source.extras, error })

    return this.update({ extras })
  }

  async setExtraDetails(detailObject?: Record<string, unknown>) {
    const details = formatMessageDetails(detailObject)
    const extras = MessageExtrasModel.safeParse({ ...this.source.extras, details }).data

    await this.update({ extras })
  }

  async setVariation(variation?: MessageViewModel) {
    return await this.update({ selectedVariationId: variation?.id })
  }

  async removeVariation(variation: MessageViewModel) {
    const variationIds = _.without(this.source.variationIds, variation.id)

    let selectedVariationId = this.source.selectedVariationId
    if (selectedVariationId === variation.id) {
      selectedVariationId = undefined
    }

    await this.update({ selectedVariationId, variationIds })
    await messageTable.destroy(variation.source)

    this.variationViewModelCache.remove(variation.id)
  }

  async addVariation(variation: MessageModel) {
    const variationIds = this.source.variationIds.concat(variation.id)

    // add variation to cache
    const viewModel = this.variationViewModelCache.put(variation)

    // update message with variation id
    await this.update({ selectedVariationId: variation.id, variationIds })

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
