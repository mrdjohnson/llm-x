import _ from 'lodash'
import { makeAutoObservable } from 'mobx'

import { actorTable } from '~/core/actor/ActorTable'
import { ActorModel } from '~/core/actor/ActorModel'
import { connectionStore } from '~/core/connection/ConnectionStore'

export class ActorViewModel {
  constructor(public source: ActorModel) {
    makeAutoObservable(this)
  }

  get id() {
    return this.source.id
  }

  get connection() {
    return connectionStore.getConnectionById(this.source.connectionId ?? undefined)
  }

  get model() {
    return this.connection?.getModelById(this.source.modelId ?? undefined)
  }

  get modelName() {
    return this.model?.modelName
  }

  get label() {
    return this.source.name || this.model?.label
  }

  async update(patch: Partial<ActorModel>) {
    await actorTable.put({ ...this.source, ...patch })
  }

  async removeConnection(connectionId: string) {
    if (this.source.connectionId === connectionId) {
      await this.update({ connectionId: null, modelId: null })
    }
  }
}
