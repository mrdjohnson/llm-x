import { Factory } from 'fishery'
import { generateMock } from '@anatine/zod-mock'

import { ActorModel } from '~/core/actor/ActorModel'
import { ActorViewModel } from '~/core/actor/ActorViewModel'
import { actorStore } from '~/core/actor/ActorStore'

export const ActorModelFactory = Factory.define<ActorModel, null, ActorViewModel>(
  ({ sequence, params, onCreate }) => {
    onCreate(async actorModel => {
      const actorViewModel = await actorStore.createActor(actorModel)

      return actorViewModel
    })

    return {
      ...generateMock(ActorModel),
      ...params,
      id: sequence.toString(),
    }
  },
)
