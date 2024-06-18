import { types } from 'mobx-state-tree'
import { ActorModel, IActorModel } from '~/models/actor/ActorModel'

const DeactivatedActorByIdModel = types.model({
  id: types.identifier,
  disabled: types.boolean,
})

// todo: remove? 
// Deprecated 
export const ChatActorStore = types
  .model({
    selectedActors: types.array(types.safeReference(ActorModel)),
    deactivatedMap: types.map(DeactivatedActorByIdModel),
  })
  .actions(self => {
    return {
      addActor(actor: IActorModel) {
        self.selectedActors.push(actor)
      },

      removeActor(actor: IActorModel) {
        self.selectedActors.remove(actor)

        // temp until we figure out how to remove
        self.deactivatedMap.put({ id: actor.id, disabled: false })
      },

      deactivateActor(actor: IActorModel) {
        self.deactivatedMap.put({ id: actor.id, disabled: true })
      },
    }
  })
