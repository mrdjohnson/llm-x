import { Factory } from 'fishery'
import { generateMock } from '@anatine/zod-mock'
import _ from 'lodash'

import { ActorModel } from '~/core/actor/ActorModel'
import { ActorViewModel } from '~/core/actor/ActorViewModel'
import { actorStore } from '~/core/actor/ActorStore'
import { ConnectionViewModelTypes } from '~/core/connection/viewModels'
import { type ConnectionModel } from '~/core/connection/ConnectionModel'

import {
  ConnectionModelFactory,
  ConnectionFactoryOptions,
} from '~/core/connection/ConnectionModel.factory'

export type ActorConnectionOptions = ConnectionFactoryOptions & {
  connection?: ConnectionViewModelTypes
  connectionParams?: Partial<ConnectionModel>
}

class ActorModelFactoryClass extends Factory<ActorModel, null, ActorViewModel> {
  // if the connection has models we assign the model to the actor
  withOptions({ connection, connectionParams, ...options }: ActorConnectionOptions) {
    const { models, modelCount } = options

    if (connection && (_.isEmpty(models) || modelCount === 0)) {
      return this.params({ connectionId: connection.id })
    }

    // after making the actor, create a connection and update the id
    return this.afterCreate(async actor => {
      connection ||= await ConnectionModelFactory.withOptions(options).create({
        ...connectionParams,
        type: 'Ollama',
      })

      const [model] = connection.models

      await actor.update({ connectionId: connection.id, modelId: model?.id })

      return actor
    })
  }
}

export const ActorModelFactory = ActorModelFactoryClass.define(({ sequence, params, onCreate }) => {
  onCreate(async actorModel => {
    const actorViewModel = await actorStore.createActor(actorModel)

    return actorViewModel
  })

  return {
    ...generateMock(ActorModel),
    ...params,
    id: sequence.toString(),
  }
})
