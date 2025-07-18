import { setServerResponse } from '~/tests/msw'

import { ConnectionViewModelTypes } from '~/core/connection/viewModels'
import { BaseModelTypes } from '~/core/connection/types'

export const setServerResponseForModels = (
  connection: ConnectionViewModelTypes,
  models: BaseModelTypes[],
) => {
  const host = connection.formattedHost
  let modelUrl: string
  let response: object = { data: models }

  switch (connection.type) {
    case 'Ollama':
      modelUrl = host + '/api/tags'
      response = { models }
      break

    case 'LMS':
    case 'OpenAi':
      modelUrl = host + '/models'
      break

    case 'A1111':
      modelUrl = host + '/sdapi/v1/sd-models'
      break

    // Gemini
    default:
      throw new Error('unsupported model types')
  }

  setServerResponse(modelUrl, response)

  return host
}
