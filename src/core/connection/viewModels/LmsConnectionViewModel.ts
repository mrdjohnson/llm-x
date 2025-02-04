import _ from 'lodash'

import { ConnectionModel } from '~/core/connection/ConnectionModel'
import { connectionTable } from '~/core/connection/ConnectionTable'
import OpenAiConnectionViewModel from '~/core/connection/viewModels/OpenAiConnectionViewModel'

const DefaultHost = 'http://127.0.0.1:1234/v1'

class LmsConnectionViewModel extends OpenAiConnectionViewModel {
  DefaultHost: string = DefaultHost

  type = 'LMS' as const

  readonly hostLabel = 'LM Studio Host:'
  readonly enabledLabel = 'Text generation through LM Studio:'

  constructor(
    public source: ConnectionModel,
    { autoFetch = true } = {},
  ) {
    if (source.host?.startsWith('ws')) {
      source.host = source.host.replace('ws', 'http') + '/v1'
    }

    super(source, { autoFetch })
  }

  static toViewModel(connection: ConnectionModel, { autoFetch = true } = {}) {
    return new this(connection, { autoFetch })
  }

  static readonly getSnapshot = (): ConnectionModel =>
    connectionTable.parse({
      label: 'LM Studio (open ai)',
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
}

export default LmsConnectionViewModel
