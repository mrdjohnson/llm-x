import { http, HttpResponse } from 'msw'

import { setServerResponse, server } from '~/tests/msw'

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
      response = models
      break

    // Gemini
    default:
      throw new Error('unsupported model types')
  }

  setServerResponse(modelUrl, response)

  if (connection.type === 'Ollama') {
    setServerResponseForOllamaShow(host, [])
  }

  return host
}

export const setServerResponseForOllamaShow = (host: string, capabilities: string[]) => {
  setServerResponse(host + '/api/show', { capabilities })
}

export const setServerResponseForOllamaShowByModelName = (host: string, imageModelName: string) => {
  server.use(
    http.all(host + '/api/show', async ({ request }) => {
      const { model } = (await request.json()) as { model: string }

      return HttpResponse.json({
        capabilities: model === imageModelName ? ['image'] : [],
      })
    }),
  )
}
