import { ChatOllama } from '@langchain/community/chat_models/ollama'
import { AIMessage, HumanMessage, SystemMessage, BaseMessage } from '@langchain/core/messages'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'

import { IMessageModel } from '../models/MessageModel'
import { DefaultHost, settingStore } from '../models/SettingStore'
import { personaStore } from '../models/PersonaStore'

const createHumanMessage = (message: IMessageModel): HumanMessage => {
  if (message.image) {
    return new HumanMessage({
      content: [
        {
          type: 'text',
          text: message.content,
        },
        {
          type: 'image_url',
          image_url: message.image,
        },
      ],
    })
  }

  return new HumanMessage(message.content)
}

const getMessages = (chatMessages: IMessageModel[], incomingMessage: IMessageModel) => {
  const messages: BaseMessage[] = []

  const selectedPersona = personaStore.selectedPersona

  if (selectedPersona) {
    messages.push(new SystemMessage(selectedPersona.description))
  }

  for (const message of chatMessages) {
    if (message.uniqId === incomingMessage.uniqId) break

    if (message.fromBot) {
      messages.push(new AIMessage(message.content))
    } else {
      messages.push(createHumanMessage(message))
    }
  }

  return messages
}

export class OllmaApi {
  private static abortController?: AbortController

  static async *streamChat(chatMessages: IMessageModel[], incomingMessage: IMessageModel) {
    const model = settingStore.selectedModel?.name
    if (!model) return

    const host = settingStore.host || DefaultHost

    OllmaApi.abortController = new AbortController()

    const messages = getMessages(chatMessages, incomingMessage)

    const chatOllama = new ChatOllama({
      baseUrl: host,
      model,
      keepAlive: '20m',
    }).bind({ signal: OllmaApi.abortController.signal })

    const stream = await ChatPromptTemplate.fromMessages(messages)
      .pipe(chatOllama)
      .pipe(new StringOutputParser())
      .stream({})

    for await (const chunk of stream) {
      yield chunk
    }

    this.abortController = undefined
  }

  static cancelStream() {
    if (!OllmaApi.abortController) return

    OllmaApi.abortController.abort('Stream ended manually')

    OllmaApi.abortController = undefined
  }
}
