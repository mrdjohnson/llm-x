import { type ModelResponse } from 'ollama/browser'

import { toOllamaModel } from '~/core/transformers/toOllamaModel'
import { LanguageModelType } from '~/core/LanguageModel'
import { ConnectionModel } from '~/core/connection/ConnectionModel'

export type IGeminiModel = { name: string }

export type IA1111Model = {
  title: string
  modelName: string
  type: 'A1111'
}

export type IOllamaModel = ReturnType<typeof toOllamaModel>

export type IOpenAiModel = {
  _id: string
  object: string
  created: number
  ownedBy: string
}

export type A1111LanguageModel = LanguageModelType<IA1111Model>
export type OllamaLanguageModel = LanguageModelType<IOllamaModel>
export type OpenAiLanguageModel = LanguageModelType<IOpenAiModel>
export type GeminiLanguageModel = LanguageModelType<IGeminiModel>

export type LanguageModelTypes =
  | A1111LanguageModel
  | OllamaLanguageModel
  | OpenAiLanguageModel
  | GeminiLanguageModel

export type ConnectionTypes = ConnectionModel['type']

export type BaseModelTypes = ModelResponse | IA1111Model | IOpenAiModel | IGeminiModel

export type { BaseLanguageModel } from '~/core/LanguageModel'
