import { lazy } from 'react'
import { SnapshotIn } from 'mobx-state-tree'
import { SortType as SelectionPanelSortType } from '~/components/SelectionTablePanel'

import LanguageModel, { LanguageModelType } from '~/core/LanguageModel'
import { IObservableArray, makeObservable, observable } from 'mobx'
import BaseConnectionViewModel from '~/core/connection/viewModels/BaseConnectionViewModel'
import ollamaApi from '~/core/connection/api/OllamaApi'

import Image from '~/icons/Image'
import { Ollama } from 'ollama/browser'
import { toOllamaModel } from '~/core/transformers/toOllamaModel'
import { IOllamaModel, OllamaLanguageModel, IConnectionDataModel } from '~/core/types'

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
    { label: 'Updated', value: 'modifiedAt', invertOrder: true },
  ]

  primaryHeader = this.modelTableHeaders[0].value

  models: IObservableArray<OllamaLanguageModel> = observable.array()

  type = 'Ollama' as const

  constructor(public connectionModel: IConnectionDataModel) {
    super(connectionModel)

    makeObservable(this, BaseConnectionViewModel.MOBX_MAPPINGS)
  }

  readonly hostLabel = 'Ollama Host:'
  readonly enabledLabel = 'Text generation through Ollama:'

  static readonly getSnapshot = (): SnapshotIn<IConnectionDataModel> => ({
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

    return models.map(toOllamaModel).map(LanguageModel.fromIOllamaModel)
  }
}

export default OllamaConnectionViewModel
