import { MessageViewModel } from '~/core/message/MessageViewModel'

abstract class BaseApi {
  static abortControllerById: Record<string, () => Promise<void>> = {}

  abstract generateImages(
    prompt: string,
    incomingMessageVariation: MessageViewModel,
  ): Promise<string[]>

  abstract generateChat(
    chatMessages: MessageViewModel[],
    incomingMessage: MessageViewModel,
    handleChunk: (chunk: string) => void
  ): Promise<void>

  static async cancelGeneration(id?: string) {
    if (id) {
      if (!BaseApi.abortControllerById[id]) return

      await BaseApi.abortControllerById[id]?.()

      delete BaseApi.abortControllerById[id]
    } else {
      for (const id in BaseApi.abortControllerById) {
        await BaseApi.abortControllerById[id]?.()
      }

      BaseApi.abortControllerById = {}
    }
  }
}

export default BaseApi
