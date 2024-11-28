import camelcaseKeys from 'camelcase-keys'
import axios from 'axios'

import { SortType as SelectionPanelSortType } from '~/components/SelectionTablePanel'
import LanguageModel, { LanguageModelType } from '~/core/LanguageModel'

import { A1111LanguageModel, IA1111Model } from '~/core/connection/types'
import { BaseConnectionViewModel } from '~/core/connection/viewModels/BaseConnectionViewModel'
import { ConnectionModel } from '~/core/connection/ConnectionModel'
import { connectionTable } from '~/core/connection/ConnectionTable'

const DefaultHost = 'http://127.0.0.1:7860'

class A1111ConnectionViewModel extends BaseConnectionViewModel<IA1111Model> {
  DefaultHost: string = DefaultHost

  modelTableHeaders: SelectionPanelSortType<LanguageModelType<IA1111Model>>[] = [
    { label: 'Title', value: 'title' },
    { label: 'Name', value: 'modelName' },
  ]

  type = 'A1111' as const

  readonly hostLabel = 'AUTOMATIC1111 Host:'
  readonly enabledLabel = 'Image generation through AUTOMATIC1111:'

  static toViewModel(connection: ConnectionModel, { autoFetch = true } = {}) {
    return new this(connection, { autoFetch })
  }

  static getSnapshot = (): ConnectionModel =>
    connectionTable.parse({
      label: 'A1111',
      type: 'A1111',

      host: DefaultHost,
      enabled: true,

      parameters: [
        { field: 'width', types: ['system'], isJson: true, defaultValue: '512' },
        { field: 'height', types: ['system'], isJson: true, defaultValue: '512' },
        { field: 'steps', types: ['system'], isJson: true, defaultValue: '25' },
        {
          field: 'batch_size',
          label: 'batch size',
          types: ['system'],
          isJson: true,
          defaultValue: '1',
        },
      ],
    })

  async _fetchLmModels(host: string): Promise<A1111LanguageModel[]> {
    const response = await axios.get(`${host}/sdapi/v1/sd-models`)

    return camelcaseKeys<IA1111Model[]>(response.data).map(a1111Model =>
      LanguageModel.fromIA1111Model(a1111Model, this.id),
    )
  }

  override modelFilter(model: A1111LanguageModel, filterText: string) {
    return (
      model.modelName.toLowerCase().includes(filterText.toLowerCase()) ||
      model.label.toLowerCase().includes(filterText.toLowerCase())
    )
  }
}

export default A1111ConnectionViewModel
