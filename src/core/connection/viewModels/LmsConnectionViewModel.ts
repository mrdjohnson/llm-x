import { lazy } from 'react'
import { SnapshotIn } from 'mobx-state-tree'
import _ from 'lodash'
import { DownloadedModel, LMStudioClient } from '@lmstudio/sdk'
import { IObservableArray, makeObservable, observable } from 'mobx'

import { SortType as SelectionPanelSortType } from '~/components/SelectionTablePanel'
import BaseConnectionViewModel from '~/core/connection/viewModels/BaseConnectionViewModel'
import lmsApi from '~/core/connection/api/LmsApi'

import LanguageModel from '~/core/LanguageModel'
import { IConnectionDataModel, ILmsModel, LmsLanguageModel } from '~/core/types'
import { toLmsModel } from '~/core/transformers/toLmsModel'

const LazyLmsModelPanel = lazy(() => import('~/features/settings/panels/model/LmsModelPanel'))

const DefaultHost = 'ws://127.0.0.1:1234'
class LmsConnectionViewModel extends BaseConnectionViewModel<ILmsModel> {
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

    makeObservable(this, BaseConnectionViewModel.MOBX_MAPPINGS)
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

  validateHost(host?: string) {
    if (!host) return true

    if (!host.startsWith('ws')) return 'Host needs to start with ws:// or wss://'

    return true
  }

  async _fetchLmModels(host: string): Promise<LmsLanguageModel[]> {
    const client = new LMStudioClient({ baseUrl: host })

    const response: DownloadedModel[] = await client.system.listDownloadedModels()

    const lmsModel: ILmsModel[] = _.filter(response, { type: 'llm' }).map(toLmsModel)

    const models: LmsLanguageModel[] = lmsModel.map(LanguageModel.fromILmsModel)

    return models
  }
}

export default LmsConnectionViewModel
