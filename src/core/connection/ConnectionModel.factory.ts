import { Factory } from 'fishery'
import _ from 'lodash'

import { ConnectionModel } from '~/core/connection/ConnectionModel'
import { connectionViewModelByType, ConnectionViewModelTypes } from '~/core/connection/viewModels'

export const ConnectionModelFactory = Factory.define<
  ConnectionModel,
  null,
  ConnectionViewModelTypes
>(({ sequence, onCreate, params }) => {
  onCreate(connectionModel => {
    const ConnectionViewModelClass = connectionViewModelByType[connectionModel.type]()

    return ConnectionViewModelClass.toViewModel(connectionModel)
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
})
