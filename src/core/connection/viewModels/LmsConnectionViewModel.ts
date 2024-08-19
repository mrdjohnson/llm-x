import { lazy } from 'react'
import _ from 'lodash'
import { DownloadedModel, LMStudioClient } from '@lmstudio/sdk'

import { SortType as SelectionPanelSortType } from '~/components/SelectionTablePanel'
import { toLmsModel } from '~/core/transformers/toLmsModel'
import LanguageModel from '~/core/LanguageModel'

import { ILmsModel, LmsLanguageModel } from '~/core/connection/types'
import { BaseConnectionViewModel } from '~/core/connection/viewModels/BaseConnectionViewModel'
import { ConnectionModel } from '~/core/connection/ConnectionModel'
import { connectionTable } from '~/core/connection/ConnectionTable'
import lmsApi from '~/core/connection/api/LmsApi'

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

  type = 'LMS' as const

  readonly hostLabel = 'LM Studio Host:'
  readonly enabledLabel = 'Text generation through LM Studio:'

  static toViewModel(connection: ConnectionModel) {
    return new this(connection)
  }

  static readonly getSnapshot = (): ConnectionModel =>
    connectionTable.parse({
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

    const lmsModels: ILmsModel[] = _.filter(response, { type: 'llm' }).map(toLmsModel)

    const models: LmsLanguageModel[] = lmsModels.map(lmsModel =>
      LanguageModel.fromILmsModel(lmsModel, this.id),
    )

    return models
  }
}

export default LmsConnectionViewModel
