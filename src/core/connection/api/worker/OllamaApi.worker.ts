import { ChatOllama, OllamaEmbeddings, Ollama } from '@langchain/ollama'
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  BaseMessage,
  type MessageContentImageUrl,
} from '@langchain/core/messages'
import { ChatPromptTemplate, MessagesPlaceholder, PromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import _ from 'lodash'

import CachedStorage from '~/utils/CachedStorage'
import BaseApi from '~/core/connection/api/BaseApi'
import { MessageViewModel } from '~/core/message/MessageViewModel'
import { personaStore } from '~/core/persona/PersonaStore'
import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents'
import {
  RunnableBranch,
  RunnableMap,
  RunnablePassthrough,
  RunnableSequence,
} from '@langchain/core/runnables'

export const getWebData = async (url: string) => {
  const loader = new CheerioWebBaseLoader(url)

  const docs = await loader.load()

  return docs
}
