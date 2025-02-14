import { Factory } from 'fishery'
import { generateMock } from '@anatine/zod-mock'
import { z } from 'zod'

import { IA1111Model, IGeminiModel, IOllamaModel, IOpenAiModel } from '~/core/connection/types'
import { ModelResponse } from 'ollama/browser'
import { toOllamaModel } from '~/core/transformers/toOllamaModel'

const OllamaModel = z.object({
  name: z.string(),
  modified_at: z.date(),
  size: z.number(),
  digest: z.string(),
  details: z.object({
    parent_model: z.string(),
    format: z.string(),
    family: z.string(),
    families: z.array(z.string()),
    parameter_size: z.string(),
    quantization_level: z.string(),
  }),
})

export const OllamaModelFactory = Factory.define<ModelResponse, null, IOllamaModel>(
  ({ onCreate }) => {
    onCreate(response => toOllamaModel(response))
    return generateMock(OllamaModel)
  },
)

const A1111Model = z.object({
  title: z.string(),
  modelName: z.string(),
  type: z.literal('A1111'),
})

export const A1111ModelFactory = Factory.define<IA1111Model>(() => {
  return generateMock(A1111Model)
})

const OpenAiModel = z.object({
  _id: z.string(),
  object: z.string(),
  created: z.number(),
  ownedBy: z.string(),
})

export const OpenAiModelFactory = Factory.define<IOpenAiModel>(() => {
  return generateMock(OpenAiModel)
})

const GeminiModel = z.object({
  name: z.string().default('Gemini nano mock'),
})

export const GeminiModelFactory = Factory.define<IGeminiModel>(() => {
  return generateMock(GeminiModel)
})
