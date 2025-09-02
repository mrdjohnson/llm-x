import localforage from 'localforage'
import { makeAutoObservable } from 'mobx'
import * as cheerio from 'cheerio/slim'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio'
import { htmlToText } from 'html-to-text'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { Document } from '@langchain/core/documents'
import { OllamaEmbeddings } from '@langchain/ollama'
import _ from 'lodash'

import { messenger } from '~/core/messenger/Messenger.platform'
import { toastStore } from '~/core/ToastStore'

class KnowledgeStore {
  documents: Document[] | undefined | null
  vectorStore: MemoryVectorStore | undefined
  currentUrl: string | undefined
  currentPageTitle: string | undefined

  documentDB = localforage.createInstance({ name: 'llm-x', storeName: 'documents' })

  documentStatus = {
    isLoadingDocuments: false,
    isDocumentsLoaded: false,
  }

  isActive = false
  isListening = false

  constructor() {
    makeAutoObservable(this)
  }

  get displayName() {
    return this.currentPageTitle || this.currentUrl
  }

  listen() {
    if (this.isListening || __PLATFORM__ !== 'chrome') return
    this.isListening = true

    messenger.onMessage('pageContent', message => {
      if (message.data) {
        knowledgeStore.createVectorStoreFromHtml(message.data)
      } else {
        knowledgeStore.documentStatus.isLoadingDocuments = false
      }
    })

    messenger.onMessage('tabChanged', message => {
      if (!message.data) return

      knowledgeStore.setCurrentUrl(message.data.url)
      knowledgeStore.setCurrentPageTitle(message.data.title)
    })
  }

  private async createVectorStoreFromCheerio(api: cheerio.CheerioAPI) {
    this.vectorStore = undefined

    const $ = api

    const mainContent = $('[role="main"]').html() || $('main').html() || $('body').html() || ''

    const readableContent = htmlToText(mainContent)

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 100,
    })

    this.documents = await textSplitter.createDocuments([readableContent])

    this.documentStatus.isDocumentsLoaded = true
    this.documentStatus.isLoadingDocuments = false
  }

  async createVectorStoreFromHtml(html: string) {
    await this.createVectorStoreFromCheerio(
      cheerio.load(html, {
        xml: {
          xmlMode: false,
        },
      }),
    )
    await this.createOrGetVectorStore()
  }

  async createVectorStoreFromUrl(url: string) {
    const loader = new CheerioWebBaseLoader(url)

    return this.createVectorStoreFromCheerio(await loader.scrape())
  }

  async createOrGetVectorStore(baseUrl?: string, model?: string) {
    debugger
    if (!this.isActive) return undefined
    if (this.vectorStore) return this.vectorStore

    this.documents ||= await this.documentDB.getItem(
      'https://developer.chrome.com/docs/extensions/how-to/test/puppeteer',
    )

    if (!this.documents) return undefined

    toastStore.addToast('creating vector store with documents: ' + this.documents.length, 'info')

    this.vectorStore = await MemoryVectorStore.fromDocuments(
      this.documents,
      new OllamaEmbeddings({
        model: 'mxbai-embed-large:latest',
        baseUrl,
      }),
    )

    return this.vectorStore
  }

  createVectorStoreFromPageContent() {
    this.documentStatus.isLoadingDocuments = true
    // tells the background tab to give us the page content
    messenger.sendMessage('pageContent', undefined)
  }

  setCurrentUrl(url?: string) {
    this.currentUrl = url
  }

  setCurrentPageTitle(title?: string) {
    this.currentPageTitle = title
  }

  toggleActive() {
    this.isActive = !this.isActive
  }
}

export const knowledgeStore = new KnowledgeStore()
