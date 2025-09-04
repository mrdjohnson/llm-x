import _ from 'lodash'

import BaseApi from '~/core/connection/api/BaseApi'
import { MessageViewModel } from '~/core/message/MessageViewModel'
import { personaStore } from '~/core/persona/PersonaStore'
import { connectionStore } from '~/core/connection/ConnectionStore'
import { progressStore, ProgressType } from '~/core/ProgressStore'
import { ChatViewModel } from '~/core/chat/ChatViewModel'

const getMessages = async (chatMessages: MessageViewModel[], chatMessageId: string) => {
  const messages: AILanguageModelPrompt[] = []

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
  async *generateChat(
    chat: ChatViewModel,
    incomingMessageVariant: MessageViewModel,
  ): AsyncGenerator<string> {
    const connection = connectionStore.selectedConnection
    if (!connection) return

    const abortController = new AbortController()

    BaseApi.abortControllerById[incomingMessageVariant.id] = async () => abortController.abort()

    const parameters = connection.parsedParameters
    await incomingMessageVariant.setExtraDetails({ sentWith: parameters })

    const { available, defaultTemperature, defaultTopK, maxTopK } =
      await window.ai.languageModel.capabilities()

    const userTopK =
      (connection.parsedParameters['topK'] as number | undefined) ?? defaultTopK ?? undefined
    const temperature =
      (connection.parsedParameters['temperature'] as number | undefined) ??
      defaultTemperature ??
      undefined

    const topK = _.min([userTopK, maxTopK ?? undefined])

    const messages = await getMessages(chat.messages, incomingMessageVariant.rootMessage.id)

    let progress: ProgressType | undefined = undefined

    if (available === 'after-download') {
      progress = progressStore.create({ value: 0, label: 'Gemini downloading' })
    }

    const model = await window.ai.languageModel.create({
      temperature,
      topK,
      initialPrompts: messages,
      monitor(m) {
        m.addEventListener('downloadprogress', e => {
          if (!progress) return

          const loaded = _.toNumber(_.get(e, 'loaded'))
          const total = _.toNumber(_.get(e, 'total'))

          progress.update({ value: loaded / total, subLabel: `${loaded} of ${total} bytes.` })

          if (loaded === total) {
            progressStore.delete(progress, { shouldDelay: true })
          }
        })
      },
      signal: abortController.signal,
    })

    if (!abortController.signal.aborted) {
      const stream = model.promptStreaming('', {
        signal: abortController.signal,
      })

      let previousChunk = ''
      for await (const chunk of stream) {
        // "chunk" comes in as the entire message, this is a bug on the api side, this fixes it for now until its changed later
        const newChunk = chunk.startsWith(previousChunk) ? chunk.slice(previousChunk.length) : chunk

        previousChunk = chunk

        yield newChunk
      }
    }

    delete BaseApi.abortControllerById[incomingMessageVariant.id]
  }

  generateImages(): Promise<string[]> {
    throw 'unsupported'
  }
}

export const baseApi = new GeminiApi()
