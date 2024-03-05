import { IMessageModel } from '../models/MessageModel'
import { DefaultHost, settingStore } from '../models/SettingStore'
import { personaStore } from '../models/PersonaStore'

type OllamaMessage = {
  role: 'assistant' | 'user' | 'system'
  content: string
  images?: string[]
}

type OllamaResponse = {
  model: string
  created_at: string
  message: OllamaMessage
  done: boolean
}

export class OllmaApi {
  private static abortController?: AbortController

  static async *streamChat(chatMessages: IMessageModel[], incomingMessage: IMessageModel) {
    const model = settingStore.selectedModel?.name
    if (!model) return

    const host = settingStore.host || DefaultHost

    OllmaApi.abortController = new AbortController()

    const messages: OllamaMessage[] = []

    const selectedPersona = personaStore.selectedPersona

    if (selectedPersona) {
      messages.push({
        role: 'system',
        content: selectedPersona.description,
      })
    }

    for (const message of chatMessages) {
      if (message.uniqId === incomingMessage.uniqId) break

      if (message.fromBot) {
        messages.push({ role: 'assistant', content: message.content })
        continue
      }

      const images = message.image?.includes(',') ? [message.image.split(',')[1]] : undefined

      messages.push({ role: 'user', content: message.content, images })
    }

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

      try {
        const data = JSON.parse(textChunk) as OllamaResponse

        if (data.done) break

        yield { content: data.message.content }
      } catch (error) {
        if (error instanceof Error) {
          yield { error }
        }

        // if this is the final message then break, hopefully avoids endless loop
        if (textChunk.includes('total_duration')) {
          break
        }
      }
    }

    this.abortController = undefined
  }

  static cancelStream() {
    if (!OllmaApi.abortController) return

    OllmaApi.abortController.abort('Stream ended manually')

    OllmaApi.abortController = undefined
  }
}
