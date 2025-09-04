import { MessageViewModel } from '~/core/message/MessageViewModel'
import { ChatViewModel } from '~/core/chat/ChatViewModel'

abstract class BaseApi {
  static abortControllerById: Record<string, () => Promise<void>> = {}

  abstract generateImages(
    prompt: string,
    incomingMessageVariation: MessageViewModel,
  ): Promise<string[]>

  abstract generateChat(
    chat: ChatViewModel,
    incomingMessage: MessageViewModel,
  ): AsyncGenerator<string>

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
