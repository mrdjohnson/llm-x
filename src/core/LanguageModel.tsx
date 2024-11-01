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
} from '~/core/connection/types'

export type BaseLanguageModel = {
  id: string
  label: string
  modelName: string
  type: ConnectionTypes
}

export type LanguageModelType<T> = T & BaseLanguageModel

class LanguageModel {
  static toSharedLanguageModel<T>(
    connectionId: string,
    model: T,
    sharedModel: Omit<BaseLanguageModel, 'id'>,
  ): BaseLanguageModel & T {
    return {
      ...model,

      ...sharedModel,

      id: connectionId + ':' + sharedModel.modelName,
    }
  }

  static fromILmsModel(model: ILmsModel, connectionId: string): LmsLanguageModel {
    return LanguageModel.toSharedLanguageModel(connectionId, model, {
      type: 'LMS',
      label: model.name,
      modelName: model.path,
    })
  }

  static fromIA1111Model(model: IA1111Model, connectionId: string): A1111LanguageModel {
    return LanguageModel.toSharedLanguageModel(connectionId, model, {
      type: 'A1111',
      label: model.title,
      modelName: model.modelName,
    })
  }

  static fromIOllamaModel(model: IOllamaModel, connectionId: string): OllamaLanguageModel {
    return LanguageModel.toSharedLanguageModel(connectionId, model, {
      type: 'Ollama',
      label: model.name,
      modelName: model.name,
    })
  }

  static fromIOpenAiModel(model: IOpenAiModel, connectionId: string): OpenAiLanguageModel {
    return LanguageModel.toSharedLanguageModel(connectionId, model, {
      type: 'OpenAi',
      label: model._id,
      modelName: model._id,
    })
  }
}

export default LanguageModel
