import moment from 'moment'
import { ModelResponse } from 'ollama/browser'

export const toOllamaModel = (model: ModelResponse) => {
  const paramSize = model.details.parameter_size

  let gbSize = (model.size / 1e9).toFixed(0)

  if (gbSize === '0') {
    gbSize = '< 1'
  }

  return {
    ...model,
    type: 'Ollama' as const,
    modifiedAt: model.modified_at,
    gbSize: gbSize + ' GB',
    fullGbSize: (model.size / 1e9).toFixed(2) + ' GB',
    timeAgo: moment(model.modified_at).fromNow(),
    supportsImages: model.details.families?.includes('clip') || false,
    paramSize: paramSize ? parseInt(paramSize) : NaN,
  }
}
