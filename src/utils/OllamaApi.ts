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

      // Decode the received value
      const textChunk = new TextDecoder().decode(value)

      // Split the text chunk by newline character in case it contains multiple JSON strings
      const jsonStrings = textChunk.split(/(?<=})(?=\n{)/);

      let jointContent = '';
      for (const jsonString of jsonStrings) {
        // Skip empty strings
        if (!jsonString.trim()) continue

        let data: OllamaResponse;
        try {
          data = JSON.parse(jsonString) as OllamaResponse
        } catch (error) {
          console.error('Failed to parse JSON:', jsonString);
          throw error;
        }

        if (data.done) break

        // Append the content of each message to jointContent
        jointContent += data.message.content
      }
      if (jsonStrings.length > 1) {
        console.log('Splitting the text chunk as it looks like this:\n', textChunk)
        console.log('Joint content after splitting:\n', jointContent);
      }
      // Yield the joint content of all messages
      yield jointContent
    }

    this.abortController = undefined
  }

  static cancelStream() {
    if (!OllmaApi.abortController) return

    OllmaApi.abortController.abort('Stream ended manually')

    OllmaApi.abortController = undefined
  }
}
