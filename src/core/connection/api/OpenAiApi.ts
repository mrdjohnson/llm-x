import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai'
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  BaseMessage,
  type MessageContentImageUrl,
} from '@langchain/core/messages'
import { ChatPromptTemplate, PromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import _ from 'lodash'

import CachedStorage from '~/utils/CachedStorage.platform'
import BaseApi from '~/core/connection/api/BaseApi'
import { MessageViewModel } from '~/core/message/MessageViewModel'
import { personaStore } from '~/core/persona/PersonaStore'

import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { pull } from 'langchain/hub'
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents'

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

    // skip empty chat messages
    if (!message.content) continue

    if (message.source.fromBot) {
      messages.push(new AIMessage(selectedVariation.content))
    } else {
      messages.push(await createHumanMessage(selectedVariation))
    }
  }

  return messages
}

// note; this is just a copy of the code used for ollama; may refactor later
export class OpenAiApi extends BaseApi {
  async *generateChat(
    chatMessages: MessageViewModel[],
    incomingMessageVariant: MessageViewModel,
  ): AsyncGenerator<string> {
    const connection = incomingMessageVariant.actor.connection
    const host = connection?.formattedHost

    const actor = incomingMessageVariant.actor
    const model = actor.modelName

    if (!connection || !model) return

    const abortController = new AbortController()

    BaseApi.abortControllerById[incomingMessageVariant.id] = async () => abortController.abort()

    const messages = await getMessages(chatMessages, incomingMessageVariant.rootMessage.id)
    const parameters = connection.parsedParameters
    await incomingMessageVariant.setExtraDetails({ sentWith: parameters })

    const openAIApiKey =
      _.find(connection.source.parameters, { field: 'apiKey' })?.value || 'not-needed'

    const chatOpenAi = new ChatOpenAI({
      configuration: { baseURL: 'https://localhost:11434/api' },
      modelName: model,
      openAIApiKey,
      ...parameters,

      callbacks: [
        {
          handleLLMEnd(output: object) {
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

    const customTemplate = `Use the following pieces of context to answer the question at the end.
    If you don't know the answer, just say that you don't know, don't try to make up an answer.
    Use three sentences maximum and keep the answer as concise as possible.
    Always say "thanks for asking!" at the end of the answer.
    
    {context}
    
    Question: {question}
    
    Helpful Answer:`

    const loader = new CheerioWebBaseLoader('https://lilianweng.github.io/posts/2023-06-23-agent/')

    const docs = await loader.load()

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    })
    const splits = await textSplitter.splitDocuments(docs)
    const vectorStore = await MemoryVectorStore.fromDocuments(
      splits,
      new OpenAIEmbeddings({
        apiKey: 'not-needed',
        model: model,
        configuration: { baseURL: 'https://localhost:11434/api' },
      }),
    )

    // Retrieve and generate using the relevant snippets of the blog.
    const retriever = vectorStore.asRetriever()

    const customRagPrompt = PromptTemplate.fromTemplate(customTemplate)
    const llm = new ChatOpenAI({ model: 'gpt-3.5-turbo', temperature: 0 })

    const stream = await ChatPromptTemplate.fromMessages(messages)
      .pipe(chatOpenAi)
      .pipe(new StringOutputParser())
      .stream({})

    const ragChain = await createStuffDocumentsChain({
      llm: chatOpenAi,
      prompt: customRagPrompt,
      outputParser: new StringOutputParser(),
    })

    const retrievedDocs = await retriever.invoke('what is task decomposition')

    const result = await ragChain.invoke({
      question: 'What is task decomposition?',
      context: retrievedDocs,
    })

    yield result

    // for await (const chunk of stream) {
    //   yield chunk
    // }

    delete BaseApi.abortControllerById[incomingMessageVariant.id]
  }

  generateImages(): Promise<string[]> {
    throw 'unsupported'
  }
}

export const baseApi = new OpenAiApi()
