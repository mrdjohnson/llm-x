import _ from 'lodash'

import { type SortType as SelectionPanelSortType } from '~/components/SelectionTablePanel'
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

  readonly hostLabel = undefined
  readonly enabledLabel = 'Text generation through Gemini nano:'

  constructor(
    public source: ConnectionModel,
    { autoFetch = true } = {},
  ) {
    if ('LanguageModel' in window) {
      window.Gemini = window.LanguageModel!
      // delete window['LanguageModel']
    }

    super(source, { autoFetch })
  }

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
    if (!('LanguageModel' in window)) {
      throw new Error('Gemini nano not supported')
    }

    const available = await window.LanguageModel.availability()

    console.log('Gemini capabilities', { available })

    if (available === 'unavailable') throw new Error('Gemini Unavailable')

    return [LanguageModel.fromIGeminiModel({ name: 'Gemini nano' }, this.id)]
  }

  async fetchLmModels() {
    // todo: maybe add reason for failure here
    const result = super.fetchLmModels({ skipFailedMessage: true })

    return result
  }
}

export default GeminiConnectionViewModel
