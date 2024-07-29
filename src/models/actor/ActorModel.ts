import { createId } from '@paralleldrive/cuid2'
import _ from 'lodash'
import { types, Instance } from 'mobx-state-tree'

import * as connectionStore from '~/features/connections/ConnectionModelStore'
import { personaStore } from '~/models/PersonaStore'
import { ServerConnectionTypes } from '~/features/connections/servers'

export const ActorModel = types
  .model({
    id: types.optional(types.identifier, createId),
    name: types.string,
    description: types.optional(types.string, ''),
    includeForNewChat: types.optional(types.boolean, false),
    // note: nextui does not work well with numerical ids, save these as strings for now
    personaIds: types.array(types.string),
    personaEnabled: types.optional(types.boolean, true),
    connectionModelPairs: types.map(types.array(types.string)),
  })
  .views(self => ({
    get connections(): ServerConnectionTypes[] {
      const connections = _.chain(self.connectionModelPairs)
        .keys()
        .map(connectionStore.connectionModelStore.getConnectionById)
        .compact()
        .value()

      return connections
    },

    get connectionMap() {
      return _.compact(
        _.map(self.connectionModelPairs, (modelIds, id) => {
          const connection = connectionStore.connectionModelStore.getConnectionById(id)
          if (!connection) return null

          return { connection, modelIds }
        }),
      )
    },

    get personas() {
      return _.compact(self.personaIds.map(personaStore.getPersonaById))
    },
  }))
  .actions(self => ({
    removeConnectionId(connectionId: string) {
      self.connectionModelPairs.delete(connectionId)
    },
  }))

export interface IActorModel extends Instance<typeof ActorModel> {}
