import { ChatOllama } from '@langchain/community/chat_models/ollama'
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

import { IMessageModel } from '~/core/MessageModel'
import { personaStore } from '~/core/PersonaStore'

import CachedStorage from '~/utils/CachedStorage'
import BaseApi from '~/core/connection/api/BaseApi'
import { connectionStore } from '~/core/connection/ConnectionStore'

const createHumanMessage = async (message: IMessageModel): Promise<HumanMessage> => {
  if (!_.isEmpty(message.imageUrls)) {
    const imageUrls: MessageContentImageUrl[] = []

    for (const cachedImageUrl of message.imageUrls) {
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

const getMessages = async (chatMessages: IMessageModel[], incomingMessage: IMessageModel) => {
  const messages: BaseMessage[] = []

  const selectedPersona = personaStore.selectedPersona

  if (selectedPersona) {
    messages.push(new SystemMessage(selectedPersona.description))
  }

  for (const message of chatMessages) {
    if (message.uniqId === incomingMessage.uniqId) break

    const selectedVariation = message.selectedVariation

    if (message.fromBot) {
      messages.push(new AIMessage(selectedVariation.content))
    } else {
      messages.push(await createHumanMessage(selectedVariation))
    }
  }

  return messages
}

export class OllamaApi extends BaseApi {
  async *generateChat(
    chatMessages: IMessageModel[],
    incomingMessage: IMessageModel,
    incomingMessageVariant: IMessageModel,
  ): AsyncGenerator<string> {
    const connection = connectionStore.selectedConnection
    const host = connection?.formattedHost

    const model = connectionStore.selectedModelName
    if (!connection || !host || !model) return

    const abortController = new AbortController()

    BaseApi.abortControllerById[incomingMessageVariant.uniqId] = async () => abortController.abort()

    const messages = await getMessages(chatMessages, incomingMessage)
    const parameters = connection.parsedParameters
    incomingMessageVariant.setExtraDetails({ sentWith: parameters })

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

    delete BaseApi.abortControllerById[incomingMessage.uniqId]
  }

  generateImages(): Promise<string[]> {
    throw 'unsupported'
  }
}

const ollamaApi = new OllamaApi()

export default ollamaApi
