import { Ollama } from 'ollama/browser'

import { IMessageModel } from '../models/MessageModel'
import { DefaultHost, settingStore } from '../models/SettingStore'
import { personaStore } from '../models/PersonaStore'

type OllamaMessage = {
  role: 'assistant' | 'user' | 'system'
  content: string
  images?: string[]
}

export class OllmaApi {
  private static abort?: () => void

  static async *streamChat(chatMessages: IMessageModel[], incomingMessage: IMessageModel) {
    const model = settingStore.selectedModel?.name
    if (!model) return

    const host = settingStore.host || DefaultHost

    const ollama = new Ollama({ host })

    OllmaApi.abort = () => ollama.abort()

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

    const response = await ollama.chat({ model, messages, stream: true })

    for await (const part of response) {
      yield part.message.content
    }

    this.abort = undefined
  }

  static cancelStream() {
    OllmaApi.abort?.()

    OllmaApi.abort = undefined
  }
}
