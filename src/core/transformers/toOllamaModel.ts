import moment from 'moment'
import { type ModelResponse } from 'ollama/browser'
import _ from 'lodash'

const visionFamilies = ['clip', 'mllama']

export const toOllamaModel = (model: ModelResponse) => {
  const paramSize = model.details.parameter_size

  let gbSize = (model.size / 1e9).toFixed(0)

  if (gbSize === '0') {
    gbSize = '< 1'
  }

  const supportsImages = !_.chain(model.details.families)
    .intersection(visionFamilies)
    .isEmpty()
    .value()

  return {
    ...model,
    type: 'Ollama' as const,
    modifiedAt: model.modified_at,
    gbSize: gbSize + ' GB',
    fullGbSize: (model.size / 1e9).toFixed(2) + ' GB',
    timeAgo: moment(model.modified_at).fromNow(),
    supportsImages: supportsImages,
    paramSize: paramSize ? parseInt(paramSize) : NaN,
  }
}
