import { lazy } from 'react'
import { SnapshotIn } from 'mobx-state-tree'
import { IObservableArray, makeObservable, observable } from 'mobx'
import axios from 'axios'
import camelcaseKeys from 'camelcase-keys'
import _ from 'lodash'

import { SortType as SelectionPanelSortType } from '~/components/SelectionTablePanel'
import BaseConnectionViewModel from '~/core/connection/viewModels/BaseConnectionViewModel'
import openAiApi from '~/core/connection/api/OpenAiApi'

import LanguageModel from '~/core/LanguageModel'
import { IConnectionDataModel, IOpenAiModel, OpenAiLanguageModel } from '~/core/types'

const LazyOpenAiModelPanel = lazy(() => import('~/features/settings/panels/model/OpenAiModelPanel'))

const DefaultHost = 'https://api.openai.com/v1'
class OpenAiConnectionViewModel extends BaseConnectionViewModel<IOpenAiModel> {
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

    makeObservable(this, BaseConnectionViewModel.MOBX_MAPPINGS)
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

  override modelFilter(model: OpenAiLanguageModel, filterText: string) {
    return (
      model.modelName.toLowerCase().includes(filterText.toLowerCase()) ||
      model.ownedBy.toLowerCase().includes(filterText.toLowerCase())
    )
  }
}

export default OpenAiConnectionViewModel
