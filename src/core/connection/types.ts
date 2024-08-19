import { toOllamaModel } from '~/core/transformers/toOllamaModel'
import { toLmsModel } from '~/core/transformers/toLmsModel'
import { LanguageModelType } from '~/core/LanguageModel'
import { ConnectionModel } from '~/core/connection/ConnectionModel'

export type ILmsModel = ReturnType<typeof toLmsModel>

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

export type LmsLanguageModel = LanguageModelType<ILmsModel>
export type A1111LanguageModel = LanguageModelType<IA1111Model>
export type OllamaLanguageModel = LanguageModelType<IOllamaModel>
export type OpenAiLanguageModel = LanguageModelType<IOpenAiModel>

export type LanguageModelTypes =
  | LmsLanguageModel
  | A1111LanguageModel
  | OllamaLanguageModel
  | OpenAiLanguageModel

export type ConnectionTypes = ConnectionModel['type']

export type { BaseLanguageModel } from '~/core/LanguageModel'
