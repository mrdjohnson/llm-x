import { ChatOllama } from '@langchain/ollama'
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  BaseMessage,
  type MessageContentImageUrl,
} from '@langchain/core/messages'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents'
import { createRetrievalChain } from 'langchain/chains/retrieval'
import { ChatMessageHistory } from 'langchain/stores/message/in_memory'
import { knowledgeStore } from '~/core/knowledge/KnowledgeStore'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { createHistoryAwareRetriever } from 'langchain/chains/history_aware_retriever'
import { Runnable, RunnableWithMessageHistory } from '@langchain/core/runnables'
import _ from 'lodash'

import CachedStorage from '~/utils/CachedStorage.platform'
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

  const systemPrompt =
    'You are an assistant for question-answering tasks. ' +
    'Use the following pieces of retrieved context to answer ' +
    "the question. If you don't know the answer, say that you " +
    "don't know. Use three sentences maximum and keep the " +
    'answer concise.' +
    '\n\n' +
    '{context}'
  messages.push(new SystemMessage(systemPrompt))

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
  async generateChat(
    chatMessages: MessageViewModel[],
    incomingMessageVariant: MessageViewModel,
    handleChunk: (chunk: string) => void,
  ) {
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

            console.log('stream ended with: ', output, generationInfo)
            console.log('expected generation info: ', generationInfo)

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

    const vectorStore = await knowledgeStore.createOrGetVectorStore(host)

    if (vectorStore) {
      console.log('generating from documents')
      return await this.generateChatWithKnowledge(
        chatOllama,
        messages,
        incomingMessageVariant,
        vectorStore,
        handleChunk,
      )
    }

    const stream = await ChatPromptTemplate.fromMessages(messages)
      .pipe(chatOllama)
      .pipe(new StringOutputParser())
      .stream({})

    for await (const chunk of stream) {
      handleChunk(chunk)
    }

    delete BaseApi.abortControllerById[incomingMessageVariant.id]
  }

  async generateChatWithKnowledge(
    chatOllama: Runnable,
    messages: BaseMessage[],
    incomingMessageVariant: MessageViewModel,
    vectorStore: MemoryVectorStore,
    handleChunk: (chunk: string) => void,
  ) {
    const topK = 2
    const retriever = vectorStore.asRetriever(topK)

    const contextualizeQSystemPrompt2 =
      'Given a chat history and the latest user question ' +
      'which might reference context in the chat history, ' +
      'formulate a standalone question which can be understood ' +
      'without the chat history. Do NOT answer the question, ' +
      'just reformulate it if needed and otherwise return it as is.'

    const contextualizeQPrompt = ChatPromptTemplate.fromMessages([
      ['system', contextualizeQSystemPrompt2],
      new MessagesPlaceholder('chat_history'),
      ['human', '{input}'],
    ])

    const historyAwareRetriever = await createHistoryAwareRetriever({
      llm: chatOllama,
      retriever,
      rephrasePrompt: contextualizeQPrompt,
    })

    // Answer question
    const systemPrompt2 =
      'You are an assistant for question-answering tasks about chrome extensions. ' +
      'Use the following pieces of retrieved context to answer ' +
      "the question. If you don't know the answer, say that you " +
      "don't know. Use three sentences maximum and keep the " +
      'answer concise.' +
      '\n\n' +
      '{context}'

    const qaPrompt2 = ChatPromptTemplate.fromMessages([
      ['system', systemPrompt2],
      new MessagesPlaceholder('chat_history'),
    ])

    const questionAnswerChain3 = await createStuffDocumentsChain({
      llm: chatOllama,
      prompt: qaPrompt2,
    })

    const ragChain3 = await createRetrievalChain({
      retriever: historyAwareRetriever,
      combineDocsChain: questionAnswerChain3,
    })

    const history = new ChatMessageHistory(messages)

    const conversationalRagChain2 = new RunnableWithMessageHistory({
      runnable: ragChain3,
      getMessageHistory: () => history,
      historyMessagesKey: 'chat_history',
      outputMessagesKey: 'answer',
    })

    const stream = await conversationalRagChain2.stream(
      { input: '' },
      { configurable: { sessionId: 'unique_session_id' } },
    )

    // https://js.langchain.com/docs/tutorials/qa_chat_history/#tying-it-together
    for await (const chunk of stream) {
      const content = chunk.answer || ''

      handleChunk(content)
    }

    delete BaseApi.abortControllerById[incomingMessageVariant.id]
  }

  generateImages(): Promise<string[]> {
    throw 'unsupported'
  }
}

export const baseApi = new OllamaApi()
