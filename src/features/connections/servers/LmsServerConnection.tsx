import { lazy } from 'react'
import { SnapshotIn } from 'mobx-state-tree'
import _ from 'lodash'
import { DownloadedModel, LMStudioClient } from '@lmstudio/sdk'
import { IObservableArray, makeObservable, observable } from 'mobx'

import { SortType as SelectionPanelSortType } from '~/components/SelectionTablePanel'
import ServerConnection from '~/features/connections/servers/ServerConnection'
import lmsApi from '~/features/connections/api/LmsApi'

import LanguageModel from '~/models/LanguageModel'
import { IConnectionDataModel, ILmsModel, LmsLanguageModel } from '~/models/types'
import { toLmsModel } from '~/models/transformers/toLmsModel'

const LazyLmsModelPanel = lazy(() => import('~/features/settings/panels/model/LmsModelPanel'))

const DefaultHost = 'ws://127.0.0.1:1234'
class LmsServerConnection extends ServerConnection<ILmsModel> {
  DefaultHost: string = DefaultHost

  api = lmsApi
  ModelPanel = LazyLmsModelPanel

  modelTableHeaders: Array<SelectionPanelSortType<LmsLanguageModel>> = [
    { label: 'Name', value: 'name' },
    { label: 'Size', value: 'sizeBytes' },
    { label: 'Type', value: 'architecture' },
    { label: 'Folder', value: 'folder' },
  ]

  primaryHeader = this.modelTableHeaders[0].value

  models: IObservableArray<LmsLanguageModel> = observable.array()

  type = 'LMS' as const

  constructor(public connectionModel: IConnectionDataModel) {
    super(connectionModel)

    makeObservable(this, ServerConnection.MOBX_MAPPINGS)
  }

  readonly hostLabel = 'LM Studio Host:'
  readonly enabledLabel = 'Text generation through LM Studio:'

  static readonly getSnapshot = (): SnapshotIn<IConnectionDataModel> => ({
    label: 'LM Studio',
    type: 'LMS',

    host: DefaultHost,
    enabled: true,

    parameters: [
      {
        field: 'temperature',
        types: ['system'],
        isJson: true,
        helpText:
          'Usually between 0 - 1, lower is for more consistent responses, higher is for more creative',
      },
    ],
  })

  async _fetchLmModels(host: string): Promise<LmsLanguageModel[]> {
    const client = new LMStudioClient({ baseUrl: host })

    const response: DownloadedModel[] = await client.system.listDownloadedModels()

    const lmsModel: ILmsModel[] = _.filter(response, { type: 'llm' }).map(toLmsModel)

    const models: LmsLanguageModel[] = lmsModel.map(LanguageModel.fromILmsModel)

    return models
  }
}

export default LmsServerConnection
