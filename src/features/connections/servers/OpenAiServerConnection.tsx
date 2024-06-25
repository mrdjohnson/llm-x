import { lazy } from 'react'
import { SnapshotIn } from 'mobx-state-tree'
import { IObservableArray, makeObservable, observable } from 'mobx'
import axios from 'axios'
import camelcaseKeys from 'camelcase-keys'
import _ from 'lodash'

import { SortType as SelectionPanelSortType } from '~/components/SelectionTablePanel'
import ServerConnection from '~/features/connections/servers/ServerConnection'
import openAiApi from '~/features/connections/api/OpenAiApi'

import LanguageModel from '~/models/LanguageModel'
import { IConnectionDataModel, IOpenAiModel, OpenAiLanguageModel } from '~/models/types'

const LazyOpenAiModelPanel = lazy(() => import('~/features/settings/panels/model/OpenAiModelPanel'))

const DefaultHost = 'https://api.openai.com/v1'
class OpenAiServerConnection extends ServerConnection<IOpenAiModel> {
  DefaultHost: string = DefaultHost

  api = openAiApi
  ModelPanel = LazyOpenAiModelPanel

  modelTableHeaders: Array<SelectionPanelSortType<OpenAiLanguageModel>> = [
    { label: 'Id', value: 'modelName' },
    { label: 'Type', value: 'object' },
    { label: 'Owned By', value: 'ownedBy' },
  ]

  primaryHeader = this.modelTableHeaders[0].value

  models: IObservableArray<OpenAiLanguageModel> = observable.array()

  type = 'OpenAi' as const

  constructor(public connectionModel: IConnectionDataModel) {
    super(connectionModel)

    makeObservable(this, ServerConnection.MOBX_MAPPINGS)
  }

  readonly hostLabel: string = 'Open AI Host:'
  readonly enabledLabel: string = 'Text generation through LM Studio:'

  static readonly getSnapshot = (): SnapshotIn<IConnectionDataModel> => ({
    label: 'Open AI',
    type: 'OpenAi',

    host: DefaultHost,
    enabled: true,

    parameters: [
      {
        field: 'apiKey',
        types: ['system', 'fieldRequired'],
        helpText: 'This can be empty but cannot be removed',
      },
      {
        field: 'temperature',
        types: ['system'],
        isJson: true,
        helpText:
          'Usually between 0 - 1, lower is for more consistent responses, higher is for more creative',
      },
    ],
  })

  async _fetchLmModels(host: string): Promise<OpenAiLanguageModel[]> {
    const apiKey = _.find(this.parameters, { field: 'apiKey' })?.parsedValue() || 'not-needed'

    const {
      data: { data },
    } = await axios.get(`${host}/models`, { headers: { Authorization: `Bearer ${apiKey}` } })

    type IOpenAiModelResponse = Omit<IOpenAiModel, '_id' | 'owned_by'> & {
      id: string
      owned_by: string
    }

    const trueResponse: IOpenAiModel[] = camelcaseKeys<IOpenAiModelResponse[]>(data).map(
      ({ id, ...model }) => ({ ...model, _id: id }),
    )

    return trueResponse.map(model => LanguageModel.fromIOpenAiModel(model))
  }
}

export default OpenAiServerConnection
