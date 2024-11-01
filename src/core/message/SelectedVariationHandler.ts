import _ from 'lodash'
import { makeAutoObservable } from 'mobx'

import { MessageViewModel } from '~/core/message/MessageViewModel'
import { MessageModel } from '~/core/message/MessageModel'
import EntityCache from '~/utils/EntityCache'

export class SelectedVariationHandler {
  position?: number

  constructor(
    private source: MessageModel,
    private originalVariation: MessageViewModel,
    private variationCache: EntityCache<MessageModel, MessageViewModel>,
  ) {
    makeAutoObservable(this)
  }

  get selectedVariation(): MessageViewModel {
    const selectedVariationId = this.source.selectedVariationId

    if (selectedVariationId) {
      return this.variationCache.get(selectedVariationId) || this.originalVariation
    }

    return this.originalVariation
  }

  get variations() {
    const variations = this.source.variationIds.map(variationId =>
      this.variationCache.get(variationId),
    )

    return _.compact(variations)
  }

  get displayVariations() {
    return [this.originalVariation, ...this.variations]
  }

  get selectedVariationIndex() {
    return _.indexOf(this.displayVariations, this.selectedVariation)
  }

  get previousVariation() {
    if (this.selectedVariationIndex === 0) return undefined

    return this.displayVariations[this.selectedVariationIndex - 1]
  }

  get nextVariation() {
    return this.displayVariations[this.selectedVariationIndex + 1]
  }

  get hasPreviousVariation() {
    return !!this.previousVariation
  }

  get hasNextVariation() {
    return !!this.nextVariation
  }
}
