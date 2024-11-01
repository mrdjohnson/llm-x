import { Instance } from 'mobx-state-tree'

import { ConnectionDataModel } from '~/core/connection/ConnectionDataModel'

import { toOllamaModel } from '~/core/transformers/toOllamaModel'
import { toLmsModel } from '~/core/transformers/toLmsModel'
import { LanguageModelType } from '~/core/LanguageModel'

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

export type SharedLanguageModelTypes = ILmsModel | IA1111Model | IOllamaModel

export type LmsLanguageModel = LanguageModelType<ILmsModel>
export type A1111LanguageModel = LanguageModelType<IA1111Model>
export type OllamaLanguageModel = LanguageModelType<IOllamaModel>
export type OpenAiLanguageModel = LanguageModelType<IOpenAiModel>

export interface IConnectionDataModel extends Instance<typeof ConnectionDataModel> {}
export type ConnectionTypes = IConnectionDataModel['type']

export type { BaseLanguageModel } from '~/core/LanguageModel'
