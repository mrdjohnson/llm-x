import { toOllamaModel } from '~/core/transformers/toOllamaModel'
import { LanguageModelType } from '~/core/LanguageModel'
import { ConnectionModel } from '~/core/connection/ConnectionModel'

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

export type SharedLanguageModelTypes = IA1111Model | IOllamaModel

export type A1111LanguageModel = LanguageModelType<IA1111Model>
export type OllamaLanguageModel = LanguageModelType<IOllamaModel>
export type OpenAiLanguageModel = LanguageModelType<IOpenAiModel>

export type ConnectionTypes = ConnectionModel['type']

export type { BaseLanguageModel } from '~/core/LanguageModel'
