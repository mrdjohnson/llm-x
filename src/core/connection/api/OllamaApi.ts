import { ChatOllama } from '@langchain/ollama'
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  BaseMessage,
  type MessageContentImageUrl,
} from '@langchain/core/messages'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import _ from 'lodash'

import CachedStorage from '~/utils/CachedStorage'
import BaseApi from '~/core/connection/api/BaseApi'
import { MessageViewModel } from '~/core/message/MessageViewModel'
import { personaStore } from '~/core/persona/PersonaStore'

const createHumanMessage = async (message: MessageViewModel): Promise<HumanMessage> => {
  if (!_.isEmpty(message.source.imageUrls)) {
    const imageUrls: MessageContentImageUrl[] = []

    for (const cachedImageUrl of message.source.imageUrls) {
      const imageData = await CachedStorage.get(cachedImageUrl)

      if (imageData) {
        imageUrls.push({
          type: 'image_url',
          image_url: imageData,
        })
      }
    }

    return new HumanMessage({
      content: [
        {
          type: 'text',
          text: message.content,
        },
        ...imageUrls,
      ],
    })
  }

  return new HumanMessage(message.content)
}

const getMessages = async (chatMessages: MessageViewModel[], chatMessageId: string) => {
  const messages: BaseMessage[] = []

  const selectedPersona = personaStore.selectedPersona

  if (selectedPersona) {
    messages.push(new SystemMessage(selectedPersona.description))
  }

  for (const message of chatMessages) {
    if (message.id === chatMessageId) break

    const selectedVariation = message.selectedVariation

    if (message.source.fromBot) {
      messages.push(new AIMessage(selectedVariation.content))
    } else {
      messages.push(await createHumanMessage(selectedVariation))
    }
  }

  return messages
}

export class OllamaApi extends BaseApi {
  async *generateChat(
    chatMessages: MessageViewModel[],
    incomingMessageVariant: MessageViewModel,
  ): AsyncGenerator<string> {
    const connection = incomingMessageVariant.actor.connection
    const host = connection?.formattedHost

    const actor = incomingMessageVariant.actor
    const model = actor.modelName

    if (!connection || !host || !model) return

    const abortController = new AbortController()

    BaseApi.abortControllerById[incomingMessageVariant.id] = async () => abortController.abort()

    const messages = await getMessages(chatMessages, incomingMessageVariant.rootMessage.id)
    const parameters = connection.parsedParameters
    await incomingMessageVariant.setExtraDetails({ sentWith: parameters })

    const chatOllama = new ChatOllama({
      baseUrl: host,
      model,
      ...parameters,

      callbacks: [
        {
          handleLLMEnd(output) {
            const generationInfo: Record<string, unknown> =
              _.get(output, 'generations[0][0].generationInfo') || {}

            if (!_.isEmpty(generationInfo)) {
              incomingMessageVariant.setExtraDetails({
                sentWith: parameters,
                returnedWith: generationInfo,
              })
            }
          },
        },
      ],
      // verbose: true,
    }).bind({ signal: abortController.signal })

    const stream = await ChatPromptTemplate.fromMessages(messages)
      .pipe(chatOllama)
      .pipe(new StringOutputParser())
      .stream({})

    for await (const chunk of stream) {
      yield chunk
    }

    delete BaseApi.abortControllerById[incomingMessageVariant.id]
  }

  generateImages(): Promise<string[]> {
    throw 'unsupported'
  }
}

export const baseApi = new OllamaApi()
