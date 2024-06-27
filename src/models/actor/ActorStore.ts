import _ from 'lodash'
import { makeAutoObservable } from 'mobx'
import { SnapshotIn, applySnapshot, destroy, getSnapshot, types } from 'mobx-state-tree'

import { persist } from 'mst-persist'
import { ActorModel, IActorModel } from '~/models/actor/ActorModel'

export const ActorDataStore = types
  .model({
    actors: types.array(ActorModel),
  })
  .actions(self => {
    return {
      createActor() {
        const actor = ActorModel.create({ name: 'New Actor' })

        self.actors.push(actor)

        return actor
      },

      deleteActor(actor: IActorModel) {
        destroy(actor)
      },

      duplicateActor(actor: IActorModel) {
        const snapshot = getSnapshot(actor)

        const duplicateActor = ActorModel.create({
          ..._.omit(snapshot, 'id'),
          name: snapshot.name + ' Copy',
        })

        self.actors.push(duplicateActor)

        return duplicateActor
      },

      updateActor(snapshot: SnapshotIn<IActorModel>) {
        const connection = _.find(self.actors, { id: snapshot.id })

        if (!connection) throw 'No actor found by that id'

        applySnapshot(connection, snapshot)

        return connection
      },
    }
  })

const actorDataStore = ActorDataStore.create()

class ActorStore {
  dataStore = actorDataStore

  actorToEdit?: IActorModel

  // private actorById: Record<string, IActorModel> = {}

  constructor() {
    makeAutoObservable(this)
  }

  get actors() {
    return this.dataStore.actors
  }

  setActorToEdit(actor?: IActorModel) {
    this.actorToEdit = actor
  }

  createActor() {
    this.actorToEdit = this.dataStore.createActor()
  }

  duplicateActor(actor: IActorModel) {
    const duplicateActor = this.dataStore.duplicateActor(actor)

    this.actorToEdit = duplicateActor
  }

  updateActor(snapshot: SnapshotIn<IActorModel>) {
    this.dataStore.updateActor(snapshot)

    this.actorToEdit = undefined
  }

  deleteActor(actor: IActorModel) {
    if (this.actorToEdit?.id === actor.id) {
      this.actorToEdit = undefined
    }

    this.dataStore.deleteActor(actor)
  }

  getActorById(id: string) {
    return _.find(this.actors, { id })
  }

  handleConnectionDestroyed(connectionId: string) {
    this.actors.forEach(actor => actor.removeConnectionId(connectionId))
  }
}

export const actorStore = new ActorStore()

persist('actor-store', actorDataStore).then(() => {
  console.log('updated actor store')
})
