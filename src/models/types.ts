import { Instance } from 'mobx-state-tree'

import { ConnectionDataModel } from '~/features/connections/ConnectionDataModel'

import { toOllamaModel } from '~/models/transformers/toOllamaModel'
import { toLmsModel } from '~/models/transformers/toLmsModel'
import { LanguageModelType } from '~/models/LanguageModel'

export type ILmsModel = ReturnType<typeof toLmsModel>

export type IA1111Model = {
  title: string
  modelName: string
  type: 'A1111'
}

export type IOllamaModel = ReturnType<typeof toOllamaModel>

export type IOpenAiModel = {
  _id: string,
  object: string,
  created: number,
  ownedBy: string
}

export type SharedLanguageModelTypes = ILmsModel | IA1111Model | IOllamaModel

export type LmsLanguageModel = LanguageModelType<ILmsModel>
export type A1111LanguageModel = LanguageModelType<IA1111Model>
export type OllamaLanguageModel = LanguageModelType<IOllamaModel>
export type OpenAiLanguageModel = LanguageModelType<IOpenAiModel>

export interface IConnectionDataModel extends Instance<typeof ConnectionDataModel> {}
export type ConnectionTypes = IConnectionDataModel['type']

export type { BaseLanguageModel } from '~/models/LanguageModel'
