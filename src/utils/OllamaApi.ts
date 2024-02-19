import { chatStore } from '../models/ChatStore'
import { DefaultHost, settingStore } from '../models/SettingStore'

type OllamaResponse = {
  model: string
  created_at: string
  message: {
    role: 'assistant'
    content: string
    // images: null
  }
  done: boolean
}

export class OllmaApi {
  private static abortController?: AbortController

  static async *streamChat() {
    const model = settingStore.selectedModel?.name
    if (!model) return

    const host = settingStore.host || DefaultHost
    const chat = chatStore.selectedChat!
    OllmaApi.abortController = new AbortController()

    chat.createIncomingMessage(model)

    const messages = chat.messages.map(message => {
      if (message.fromBot) {
        return { role: 'assistant', content: message.content }
      }

      const images = message.image?.includes(',') && [message.image.split(',')[1]]

      return { role: 'user', content: message.content, images }
    })

    const response = await fetch(host + '/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, messages }),
      signal: OllmaApi.abortController.signal,
    })

    if (!response.body) return

    const reader = response.body.getReader()

    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        break
      }

      // Decode the received value and parse
      const textChunk = new TextDecoder().decode(value)

      const data = JSON.parse(textChunk) as OllamaResponse

      if (data.done) break

      yield data.message.content
    }

    this.abortController = undefined
  }

  static cancelStream() {
    if (!OllmaApi.abortController) return

    OllmaApi.abortController.abort('Stream ended manually')

    OllmaApi.abortController = undefined
  }
}
