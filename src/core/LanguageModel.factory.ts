import { Factory } from 'fishery'
import { generateMock } from '@anatine/zod-mock'
import { z } from 'zod'
import { ModelResponse } from 'ollama'

import {
  BaseModelTypes,
  ConnectionTypes,
  IA1111Model,
  IGeminiModel,
  IOpenAiModel,
} from '~/core/connection/types'

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
  size_vram: z.number(),
  expires_at: z.date(),
  model: z.string(),
})

const A1111Model = z.object({
  title: z.string(),
  modelName: z.string(),
  type: z.literal('A1111'),
})

const OpenAiModel = z.object({
  _id: z.string(),
  object: z.string(),
  created: z.number(),
  ownedBy: z.string(),
})

const GeminiModel = z.object({
  name: z.string().default('Gemini nano mock'),
})

type LanguageModelOptions = {
  modelParams?: Partial<BaseModelTypes>
  modelType?: ConnectionTypes
}

class LanguageModelFactoryClass extends Factory<BaseModelTypes, { type: ConnectionTypes }> {
  withOptions({ modelParams, modelType }: LanguageModelOptions = {}) {
    return this.params(modelParams || {}).transient({ type: modelType })
  }

  ollama() {
    return this.transient({ type: 'Ollama' })
  }

  buildOllama() {
    return this.ollama().build() as ModelResponse
  }

  a1111() {
    return this.transient({ type: 'A1111' })
  }

  buildA1111() {
    return this.a1111().build() as IA1111Model
  }

  gemini() {
    return this.transient({ type: 'Gemini' })
  }

  buildGemini() {
    return this.gemini().build() as IGeminiModel
  }

  lms() {
    return this.transient({ type: 'LMS' })
  }

  buildLms() {
    return this.lms().build() as IOpenAiModel
  }

  openAi() {
    return this.transient({ type: 'OpenAi' })
  }

  buildOpenAi() {
    return this.openAi().build() as IOpenAiModel
  }
}

export const LanguageModelFactory = LanguageModelFactoryClass.define(
  ({ transientParams: { type = 'Ollama' } }) => {
    switch (type) {
      case 'Ollama':
        return generateMock(OllamaModel)

      case 'A1111':
        return generateMock(A1111Model)

      case 'Gemini':
        return generateMock(GeminiModel)

      case 'LMS':
      case 'OpenAi':
        return generateMock(OpenAiModel)

      case undefined:
        throw new Error('unsupported model type')
    }
  },
)
