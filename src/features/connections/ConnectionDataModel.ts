import { Instance, types } from 'mobx-state-tree'
import { createId } from '@paralleldrive/cuid2'
import { actorStore } from '../../models/actor/ActorStore'

export const ConnectionParameterModel = types
  .model({
    field: types.string,
    label: types.maybe(types.string),
    defaultValue: types.maybe(types.string),
    helpText: types.maybe(types.string),
    types: types.array(
      types.union(
        types.literal('system'),
        types.literal('valueRequired'),
        types.literal('fieldRequired'),
      ),
    ),
    value: types.maybe(types.string),

    // true if this should be json parsed before sending
    isJson: types.maybe(types.boolean),
  })
  .views(self => ({
    parsedValue<T = string>(): T | undefined {
      const value = self.value || self.defaultValue

      if (!value) return undefined

      if (!self.isJson) return value as T

      return JSON.parse(value) as T
    },
  }))

export interface IConnectionParameterModel extends Instance<typeof ConnectionParameterModel> {}

export const ConnectionDataModel = types
  .model({
    id: types.optional(types.identifier, createId),

    label: types.string,
    type: types.union(
      types.literal('LMS'),
      types.literal('A1111'),
      types.literal('Ollama'),
      types.literal('OpenAi'),
    ),

    host: types.maybe(types.string),
    enabled: types.optional(types.boolean, true),

    parameters: types.array(ConnectionParameterModel),
  })
  .actions(self => ({
    onDestroy() {
      actorStore.handleConnectionDestroyed(self.id)
    },
  }))
