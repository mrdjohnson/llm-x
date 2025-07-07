import axios from 'axios'
import camelcaseKeys from 'camelcase-keys'
import _ from 'lodash'

import { type SortType as SelectionPanelSortType } from '~/components/SelectionTablePanel'
import LanguageModel from '~/core/LanguageModel'

import { IOpenAiModel, OpenAiLanguageModel } from '~/core/connection/types'
import { BaseConnectionViewModel } from '~/core/connection/viewModels/BaseConnectionViewModel'
import { ConnectionModel } from '~/core/connection/ConnectionModel'
import { connectionTable } from '~/core/connection/ConnectionTable'

const DefaultHost = 'https://api.openai.com/v1'

class OpenAiConnectionViewModel extends BaseConnectionViewModel<IOpenAiModel> {
  DefaultHost: string = DefaultHost

  modelTableHeaders: Array<SelectionPanelSortType<OpenAiLanguageModel>> = [
    { label: 'Id', value: 'modelName' },
    { label: 'Type', value: 'object' },
    { label: 'Owned By', value: 'ownedBy' },
  ]

  primaryHeader = this.modelTableHeaders[0].value

  type: 'OpenAi' | 'LMS' = 'OpenAi'

  readonly hostLabel: string = 'Open AI Host:'
  readonly enabledLabel: string = 'Text generation through LM Studio:'

  static toViewModel(connection: ConnectionModel, { autoFetch = true } = {}) {
    return new this(connection, { autoFetch })
  }

  static readonly getSnapshot = (): ConnectionModel =>
    connectionTable.parse({
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
    const apiKey = _.find(this.source.parameters, { field: 'apiKey' })?.value || 'not-needed'

    const {
      data: { data },
    } = await axios.get(`${host}/models`, { headers: { Authorization: `Bearer ${apiKey}` } })

    type IOpenAiModelResponse = Omit<IOpenAiModel, '_id' | 'owned_by'> & {
      id: string
      owned_by: string
    }

    const openAiModels: IOpenAiModel[] = camelcaseKeys<IOpenAiModelResponse[]>(data).map(
      ({ id, ...model }) => ({ ...model, _id: id }),
    )

    return openAiModels.map(openAiModel => LanguageModel.fromIOpenAiModel(openAiModel, this.id))
  }

  override modelFilter(model: OpenAiLanguageModel, filterText: string) {
    return (
      model.modelName.toLowerCase().includes(filterText.toLowerCase()) ||
      model.ownedBy?.toLowerCase().includes(filterText.toLowerCase())
    )
  }
}

export default OpenAiConnectionViewModel
