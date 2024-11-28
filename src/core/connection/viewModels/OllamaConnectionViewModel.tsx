import { lazy } from 'react'

import LanguageModel, { LanguageModelType } from '~/core/LanguageModel'
import { toOllamaModel } from '~/core/transformers/toOllamaModel'

import { SortType as SelectionPanelSortType } from '~/components/SelectionTablePanel'
import Image from '~/icons/Image'
import { Ollama } from 'ollama/browser'

import { IOllamaModel, OllamaLanguageModel } from '~/core/connection/types'
import { BaseConnectionViewModel } from '~/core/connection/viewModels/BaseConnectionViewModel'
import { ConnectionModel } from '~/core/connection/ConnectionModel'
import { connectionTable } from '~/core/connection/ConnectionTable'
import ollamaApi from '~/core/connection/api/OllamaApi'
import OllamaStore from '~/core/OllamaStore'

const LazyOllamaModelPanel = lazy(() => import('~/features/settings/panels/model/OllamaModelPanel'))

const DefaultHost = 'http://localhost:11434'

class OllamaConnectionViewModel extends BaseConnectionViewModel<IOllamaModel> {
  DefaultHost: string = DefaultHost

  api = ollamaApi
  ModelPanel = LazyOllamaModelPanel

  modelTableHeaders: SelectionPanelSortType<LanguageModelType<IOllamaModel>>[] = [
    { label: 'Name', value: 'name' },
    { label: 'Params', value: 'paramSize' },
    { label: <Image />, value: 'supportsImages', tooltip: 'Supports Images?', invertOrder: true },
    { label: 'Size', value: 'size' },
    { label: 'Updated', value: 'modifiedAt', invertOrder: true, hideOnMobile: true },
  ]

  primaryHeader = this.modelTableHeaders[0].value

  type = 'Ollama' as const

  readonly hostLabel = 'Ollama Host:'
  readonly enabledLabel = 'Text generation through Ollama:'

  get store() {
    return new OllamaStore(this)
  }

  static toViewModel(connection: ConnectionModel, { autoFetch = true } = {}) {
    return new this(connection, { autoFetch })
  }

  static readonly getSnapshot = (): ConnectionModel =>
    connectionTable.parse({
      label: 'Ollama',
      type: 'Ollama',

      host: DefaultHost,
      enabled: true,

      parameters: [
        { field: 'keep_alive', types: ['system'], label: 'Keep Alive', defaultValue: '20m' },
        {
          field: 'temperature',
          types: ['system'],
          isJson: true,
          helpText:
            'Usually between 0 - 1, lower is for more consistent responses, higher is for more creative',
        },
      ],
    })

  async _fetchLmModels(host: string): Promise<OllamaLanguageModel[]> {
    const ollama = new Ollama({ host })

    const { models } = await ollama.list()

    return models
      .map(toOllamaModel)
      .map(ollamaModel => LanguageModel.fromIOllamaModel(ollamaModel, this.id))
  }
}

export default OllamaConnectionViewModel
