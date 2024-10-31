import { createId } from '@paralleldrive/cuid2'
import {
  A1111LanguageModel,
  ConnectionTypes,
  IA1111Model,
  ILmsModel,
  IOllamaModel,
  IOpenAiModel,
  LmsLanguageModel,
  OllamaLanguageModel,
  OpenAiLanguageModel,
} from '~/core/types'

export type BaseLanguageModel = {
  id: string
  label: string
  modelName: string
  type: ConnectionTypes
}

export type LanguageModelType<T> = T & BaseLanguageModel

class LanguageModel {
  static toSharedLanguageModel<T>(
    model: T,
    sharedModel: Omit<BaseLanguageModel, 'id'>,
  ): BaseLanguageModel & T {
    const id = createId()

    return {
      ...model,

      ...sharedModel,
      id,
    }
  }

  static fromILmsModel(model: ILmsModel): LmsLanguageModel {
    return LanguageModel.toSharedLanguageModel(model, {
      type: 'LMS',
      label: model.name,
      modelName: model.path,
    })
  }

  static fromIA1111Model(model: IA1111Model): A1111LanguageModel {
    return LanguageModel.toSharedLanguageModel(model, {
      type: 'A1111',
      label: model.title,
      modelName: model.modelName,
    })
  }

  static fromIOllamaModel(model: IOllamaModel): OllamaLanguageModel {
    return LanguageModel.toSharedLanguageModel(model, {
      type: 'Ollama',
      label: model.name,
      modelName: model.name,
    })
  }

  static fromIOpenAiModel(model: IOpenAiModel): OpenAiLanguageModel {
    return LanguageModel.toSharedLanguageModel(model, {
      type: 'OpenAi',
      label: model._id,
      modelName: model._id,
    })
  }
}

export default LanguageModel
