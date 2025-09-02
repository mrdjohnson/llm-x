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

import { messenger } from '~/core/crossPlatform/messenger/Messenger.platform'
import { toastStore } from '~/core/ToastStore'
import { getPlatformBridge } from '~/core/crossPlatform/bridge/Bridge.platform'

class KnowledgeStore {
  documents: Document[] | undefined | null
  vectorStore: MemoryVectorStore | undefined
  vectorStoreUrl: string | undefined
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

    // messenger.onMessage('pageContent', message => {
    //   if (message.data) {
    //     knowledgeStore.createVectorStoreFromHtml(message.data)
    //   } else {
    //     knowledgeStore.documentStatus.isLoadingDocuments = false
    //   }
    // })

    messenger.onMessage('tabChanged', message => {
      this.updateTabInfo(message.data)
    })
  }

  updateTabInfo(data?: { url: string; title: string }) {
    knowledgeStore.setCurrentUrl(data?.url)
    knowledgeStore.setCurrentPageTitle(data?.title)
  }

  private async createDocumentsFromCheerio(api: cheerio.CheerioAPI) {
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

  async createDocumentsFromHtml(html: string) {
    await this.createDocumentsFromCheerio(
      cheerio.load(html, {
        xml: {
          xmlMode: false,
        },
      }),
    )
  }

  async createVectorStoreFromUrl(url: string) {
    const loader = new CheerioWebBaseLoader(url)

    return this.createDocumentsFromCheerio(await loader.scrape())
  }

  async createOrGetVectorStore(baseUrl?: string, model?: string) {
    if (!this.isActive) return undefined

    // todo: if the source changes, we need to reload the documents and invalidate the vector store
    if (this.vectorStore) return this.vectorStore

    if (!this.vectorStore) {
      await this.createDocumentsFromPageContent()
    }

    // this.documents ||= await this.documentDB.getItem(
    //   'https://developer.chrome.com/docs/extensions/how-to/test/puppeteer',
    // )

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

  async createDocumentsFromPageContent() {
    console.log('vector store check')
    // this should be a source check, if the current sources are the same as the last time we loaded, don't reload
    if (this.vectorStore && this.currentUrl === this.vectorStoreUrl) return this.vectorStore

    console.log('creating vector store from page content')
    this.documentStatus.isLoadingDocuments = true

    console.log('getting page content from platform bridge')
    const pageContent = await getPlatformBridge()?.getPageContent()

    console.log('got page content from platform bridge', pageContent)
    if (pageContent) {
      await this.createDocumentsFromHtml(pageContent)

      this.vectorStoreUrl = this.currentUrl
    }

    this.documentStatus.isLoadingDocuments = false
  }

  clearPageContent() {
    this.vectorStore = undefined
    this.documents = undefined
    this.documentStatus.isDocumentsLoaded = false
    this.documentStatus.isLoadingDocuments = false
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
