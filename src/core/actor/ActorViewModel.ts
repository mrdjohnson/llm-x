import _ from 'lodash'
import { makeAutoObservable, reaction } from 'mobx'

import { actorTable } from '~/core/actor/ActorTable'
import { ActorModel } from '~/core/actor/ActorModel'
import { connectionStore } from '~/core/connection/ConnectionStore'
import { actorStore } from '~/core/actor/ActorStore'

export class ActorViewModel {
  private modelGeneratesImages = false

  constructor(public source: ActorModel) {
    makeAutoObservable(this)

    reaction(
      () => [this.connection?.id, this.model?.id],
      () => {
        this.refreshModelImageCapability()
      },
      { fireImmediately: true },
    )
  }

  get id() {
    return this.source.id
  }

  get isUsingDefaults() {
    return !this.source.modelId || this.source.id === '__system'
  }

  get connection() {
    const connectionId = this.source.connectionId ?? actorStore.systemActor.source.connectionId

    return connectionStore.getConnectionById(connectionId ?? undefined)
  }

  get model() {
    const modelId = this.source.modelId ?? actorStore.systemActor.source.modelId

    return this.connection?.getModelById(modelId ?? undefined)
  }

  get modelName() {
    return this.model?.modelName
  }

  get modelLabel() {
    if (!this.model) return undefined

    return this.model.label + (this.isUsingDefaults ? ' (default)' : '')
  }

  get isConnected() {
    return !!this.model
  }

  get label() {
    const name = this.source.name
    const connection = this.connection
    const model = this.model

    if (!model) {
      if (name) {
        if (connection && !connection.isConnected) {
          return name + ' (disconnected)'
        }

        return name + ' (no model found)'
      }

      return 'Disconnected model'
    }

    return this.modelLabel
  }

  get isImageGenerator() {
    if (this.isUsingDefaults) {
      const actor = actorStore.systemActor

      return actor.modelGeneratesImages || actor.connection?.type === 'A1111'
    }

    return this.modelGeneratesImages || this.connection?.type === 'A1111'
  }

  async update(patch: Partial<ActorModel>) {
    await actorTable.put({ ...this.source, ...patch })
  }

  async removeConnection(connectionId?: string) {
    if (connectionId === undefined || this.source.connectionId === connectionId) {
      await this.update({ connectionId: null, modelId: null })
    }
  }

  private async refreshModelImageCapability() {
    const connection = this.connection
    const model = this.model
    const selectionKey = model?.id

    if (!connection || !model || connection.type !== 'Ollama') {
      this.modelGeneratesImages = false

      return
    }

    try {
      const ollama = connection.store
      const { capabilities } = await ollama.show(model.modelName)

      if (this.model?.id === selectionKey) {
        this.modelGeneratesImages = capabilities?.includes('image') ?? false
      }
    } catch {
      if (this.model?.id === selectionKey) {
        this.modelGeneratesImages = false
      }
    }
  }
}
