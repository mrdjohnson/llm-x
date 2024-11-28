import _ from 'lodash'

import { SortType as SelectionPanelSortType } from '~/components/SelectionTablePanel'
import LanguageModel from '~/core/LanguageModel'

import { IGeminiModel, GeminiLanguageModel } from '~/core/connection/types'
import { BaseConnectionViewModel } from '~/core/connection/viewModels/BaseConnectionViewModel'
import { ConnectionModel } from '~/core/connection/ConnectionModel'
import { connectionTable } from '~/core/connection/ConnectionTable'

const DefaultHost = 'ws://127.0.0.1:1234'

class GeminiConnectionViewModel extends BaseConnectionViewModel<IGeminiModel> {
  DefaultHost: string = DefaultHost

  modelTableHeaders: Array<SelectionPanelSortType<GeminiLanguageModel>> = [
    { label: 'Name', value: 'name' },
  ]

  primaryHeader = this.modelTableHeaders[0].value

  type = 'Gemini' as const

  sessionModel?: AILanguageModel

  readonly hostLabel = undefined
  readonly enabledLabel = 'Text generation through Gemini nano:'

  static toViewModel(connection: ConnectionModel, { autoFetch = true } = {}) {
    return new this(connection, { autoFetch })
  }

  static readonly getSnapshot = (): ConnectionModel =>
    connectionTable.parse({
      label: 'Gemini nano',
      type: 'Gemini',

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
        {
          field: 'topK',
          types: ['system'],
          isJson: true,
          helpText:
            'How many words to consider from the top response options when generating a response',
        },
      ],
    })

  async _fetchLmModels(): Promise<GeminiLanguageModel[]> {
    if (!('ai' in window)) {
      throw new Error('ai not supported')
    }

    const { available } = await window.ai.languageModel.capabilities()

    if (available !== 'readily') throw new Error('unready yet: ' + available)

    return [LanguageModel.fromIGeminiModel({ name: 'Gemini nano' }, this.id)]
  }

  async fetchLmModels() {
    // todo: maybe add reason for failure here
    const result = super.fetchLmModels({ skipFailedMessage: true })

    return result
  }
}

export default GeminiConnectionViewModel
