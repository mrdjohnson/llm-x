import _ from 'lodash'

import BaseApi from '~/core/connection/api/BaseApi'
import { MessageViewModel } from '~/core/message/MessageViewModel'
import { personaStore } from '~/core/persona/PersonaStore'
import { connectionStore } from '~/core/connection/ConnectionStore'
import { progressStore } from '~/core/ProgressStore'
import { ChatViewModel } from '~/core/chat/ChatViewModel'

const getMessages = async (chatMessages: MessageViewModel[], chatMessageId: string) => {
  const messages: AI.LanguageModelMessage[] = []

  const selectedPersona = personaStore.selectedPersona

  if (selectedPersona) {
    messages.push({
      role: 'system',
      content: selectedPersona.description,
    })
  }

  for (const message of chatMessages) {
    if (message.id === chatMessageId) break

    const selectedVariation = message.selectedVariation

    messages.push({
      role: message.source.fromBot ? 'assistant' : 'user',
      content: selectedVariation.content,
    })
  }

  return messages
}

// note; this is just a copy of the code used for ollama; may refactor later
export class GeminiApi extends BaseApi {
  async downloadGemini(abortController: AbortController) {
    const progress = progressStore.create({ value: 0, label: 'Gemini downloading' })

    const downloadSession = await window.LanguageModel.create({
      monitor(m) {
        m.addEventListener('downloadprogress', e => {
          console.log('gemini download progress', { loaded: e.loaded, total: e.total })
          const loaded = _.round(e.loaded * 100, 2)

          progress.update({ value: loaded })

          if (loaded === 100) {
            progressStore.delete(progress, { shouldDelay: true })
          }
        })
      },
      signal: abortController.signal,
    })

    downloadSession.destroy()
  }

  async *generateChat(
    chat: ChatViewModel,
    incomingMessageVariant: MessageViewModel,
  ): AsyncGenerator<string> {
    const connection = connectionStore.selectedConnection
    if (!connection) return

    const abortController = new AbortController()

    BaseApi.abortControllerById[incomingMessageVariant.id] = async () => abortController.abort()

    const parameters = connection.parsedParameters

    const availability = await window.LanguageModel.availability()

    if (availability !== 'available') {
      await this.downloadGemini(abortController)
    }

    const { defaultTemperature, defaultTopK, maxTopK } =
      (await window.LanguageModel.params?.()) || {}

    const userTopK =
      (connection.parsedParameters['topK'] as number | undefined) ?? defaultTopK ?? undefined
    const temperature =
      (connection.parsedParameters['temperature'] as number | undefined) ??
      defaultTemperature ??
      undefined

    const topK = _.min([userTopK, maxTopK ?? undefined])

    const messages = await getMessages(chat.messages, incomingMessageVariant.rootMessage.id)

    const sentWith = { ...parameters, topK, temperature }

    if (!_.isEmpty(sentWith)) {
      await incomingMessageVariant.setExtraDetails({ sentWith })
    }

    const session = await window.LanguageModel.create({
      temperature,
      topK,
      initialPrompts: messages,
      signal: abortController.signal,
    })

    if (!abortController.signal.aborted) {
      const stream = session.promptStreaming('', {
        signal: abortController.signal,
      })

      for await (const chunk of stream) {
        yield chunk
      }
    }

    delete BaseApi.abortControllerById[incomingMessageVariant.id]
  }

  generateImages(): Promise<string[]> {
    throw 'unsupported'
  }
}

export const baseApi = new GeminiApi()
