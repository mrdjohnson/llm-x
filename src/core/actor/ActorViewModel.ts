import _ from 'lodash'
import { makeAutoObservable } from 'mobx'

import { actorTable } from '~/core/actor/ActorTable'
import { ActorModel } from '~/core/actor/ActorModel'
import { connectionStore } from '~/core/connection/ConnectionStore'
import { actorStore } from '~/core/actor/ActorStore'

export class ActorViewModel {
  constructor(public source: ActorModel) {
    makeAutoObservable(this)
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

  async update(patch: Partial<ActorModel>) {
    await actorTable.put({ ...this.source, ...patch })
  }

  async removeConnection(connectionId?: string) {
    if (connectionId === undefined || this.source.connectionId === connectionId) {
      await this.update({ connectionId: null, modelId: null })
    }
  }
}
