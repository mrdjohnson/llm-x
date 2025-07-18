import { Factory } from 'fishery'
import _ from 'lodash'

import { ConnectionModel } from '~/core/connection/ConnectionModel'
import { connectionViewModelByType, ConnectionViewModelTypes } from '~/core/connection/viewModels'
import { LanguageModelFactory } from '~/core/LanguageModel.factory'
import { BaseModelTypes } from '~/core/connection/types'

import { setServerResponseForModels } from '~/tests/helpers/setServerResponseForModels'
import { connectionStore } from '~/core/connection/ConnectionStore'

export type ConnectionFactoryOptions = {
  connectionParams?: Partial<ConnectionModel>

  modelCount?: number
  models?: BaseModelTypes[]
  modelParams?: Partial<BaseModelTypes>
}

export const addModelsToConnection = async (
  connection: ConnectionViewModelTypes,
  { models, modelCount, modelParams }: ConnectionFactoryOptions,
) => {
  if (_.isNumber(modelCount) || !models) {
    models = LanguageModelFactory.withOptions({
      modelType: connection.type,
      modelParams,
    }).buildList(modelCount ?? 1)
  }

  setServerResponseForModels(connection, models)
  await connection.fetchLmModels()
}

class ConnectionModelFactoryClass extends Factory<ConnectionModel, null, ConnectionViewModelTypes> {
  withOptions(options: ConnectionFactoryOptions = {}) {
    return this.params(options.connectionParams || {}).afterCreate(async connection => {
      await addModelsToConnection(connection, options)

      return connection
    })
  }
}

export const ConnectionModelFactory = ConnectionModelFactoryClass.define(
  ({ sequence, onCreate, params }) => {
    onCreate(async connectionModel => {
      const connectionViewModel = await connectionStore.addConnection(
        connectionModel.type,
        connectionModel,
      )

      return connectionViewModel
    })

    const ConnectionViewModelClass = params.type
      ? connectionViewModelByType[params.type]()
      : _.sample(connectionViewModelByType)!()

    const snapshot = ConnectionViewModelClass.getSnapshot()

    return {
      ...snapshot,
      ...params,
      id: sequence.toString(),
    }
  },
)
