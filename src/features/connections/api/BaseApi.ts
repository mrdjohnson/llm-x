import { IMessageModel } from '~/models/MessageModel'

abstract class BaseApi {
  static abortControllerById: Record<string, () => Promise<void>> = {}
  
  abstract generateImages(prompt: string, incomingMessageVariation: IMessageModel): Promise<string[]>

  abstract generateChat(
    chatMessages: IMessageModel[],
    incomingMessage: IMessageModel,
    incomingMessageVariant: IMessageModel,
  ): AsyncGenerator<string>

  static cancelGeneration(id?: string) {
    if (id) {
      if (!BaseApi.abortControllerById[id]) return

      BaseApi.abortControllerById[id]?.().then(() => {
        delete BaseApi.abortControllerById[id]
      })
    } else {
      for (const id in BaseApi.abortControllerById) {
        BaseApi.abortControllerById[id]?.()
      }

      BaseApi.abortControllerById = {}
    }
  }
}

export default BaseApi
