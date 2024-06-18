import { createId } from "@paralleldrive/cuid2"
import _ from "lodash"
import { types, Instance } from "mobx-state-tree"

import * as connectionStore from "~/features/connections/ConnectionModelStore"
import { personaStore } from "~/models/PersonaStore"

export const ActorModel = types
    .model({
        id: types.optional(types.identifier, createId),
        name: types.string,
        description: types.optional(types.string, ''),
        // note: nextui does not work well with numerical ids, save these as strings for now
        personaIds: types.array(types.string),
        connectionIds: types.array(types.string),
        // id: modelName
        connectionModelNameMap: types.map(types.string)
    })
    .views(self => ({
        get connections() {
            console.log('getting actor connections')

            const connections = _.compact(self.connectionIds.map(connectionStore.connectionModelStore.getConnectionById))

            if (connections.length != self.connectionIds.length) {
                console.log('unable to find all connections', connections.length, self.connectionIds.length)
            }

            return connections
        },

        get personas() {
            return _.compact(self.personaIds.map(personaStore.getPersonaById))
        },
    }))

export interface IActorModel extends Instance<typeof ActorModel> { }