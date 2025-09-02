import { MouseEvent, useEffect } from 'react'
import _ from 'lodash'

import { chatStore } from '~/core/chat/ChatStore'
import { incomingMessageStore } from '~/core/IncomingMessageStore'
import { actorStore } from '~/core/actor/ActorStore'
import { settingStore } from '~/core/setting/SettingStore'

import ChatBoxInputRow from '~/components/ChatBoxInputRow'
import ChatBoxPrompt from '~/components/ChatBoxPrompt'
import ToastCenter from '~/components/ToastCenter'

import Stop from '~/icons/Stop'

import { lightboxStore } from '~/features/lightbox/LightboxStore'
import { ChatBoxMessage } from '~/components/message/ChatBoxMessage'
import ScrollableChatFeed from '~/containers/ScrollableChatFeed'
import ModelAndPersonaDisplay from '~/components/ModelAndPersonaDisplay'

import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio'
import { convert } from 'html-to-text'
import { NodeHtmlMarkdown } from 'node-html-markdown'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import localForage from 'localforage'
import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github'
import { messenger } from '~/core/crossPlatform/messenger/Messenger.platform'
import { toastStore } from '../core/ToastStore'
import * as cheerio from 'cheerio'

const documentDB = localForage.createInstance({ name: 'llm-x', storeName: 'documents' })

// const getPageText = async (pageContent: string) => {
//   const $ = await cheerio.load(pageContent)

//   // inspired by page-assist
//   const mainContent = $('[role="main"]').html() || $('main').html() || $('body').html() || ''

//   return convert(mainContent)
// }

// messenger.onMessage('pageContent', async ({ data: pageContent = '' }) => {
//   console.log('content revieced from background', pageContent)

//   const pageText = await getPageText(pageContent)

//   toastStore.addToast(pageText, 'info')
// })

const ChatBox = () => {
  const chat = chatStore.selectedChat

  useEffect(() => {
    chat?.fetchMessages()

    return () => {
      chat?.dispose()
    }
  }, [chat])

  if (!chat) return null

  const handleMessageToSend = async (userMessageContent: string) => {
    if (chat.messageToEdit) {
      await chat.commitMessageToEdit(userMessageContent)

      if (chat.messageToEdit?.source.fromBot) {
        chat.setMessageToEdit(undefined)
      } else {
        chat.findAndRegenerateResponse()
      }
    } else {
      await chat.addUserMessage(userMessageContent)

      const incomingMessage = await chat.createAndPushIncomingMessage()

      incomingMessage.setCreationActor(chat.actors[0] || actorStore.systemActor)

      for (const actor of _.drop(chat.actors)) {
        console.log('other actor: ', actor.modelName)
        const variationModel = await chat.createIncomingMessage()

        const variation = await incomingMessage.addVariation(variationModel)

        variation.setCreationActor(actor)

        incomingMessageStore.generateMessage(chat, variation)

        incomingMessage.setShowVariations(true)
      }

      incomingMessageStore.generateMessage(chat, incomingMessage)
    }
  }

  const handleMessageStopped = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    incomingMessageStore.abortGeneration()
  }

  const isGettingData = incomingMessageStore.isGettingData
  const isEditingMessage = !!chat.messageToEdit
  const variationIdToEdit = chat.variationToEdit?.id
  const lightboxMessageId = lightboxStore.lightboxMessage?.id
  const isSidebarOpen = settingStore.setting.isSidebarOpen

  const findLinks = async () => {
    // await loadRepo()

    console.log('sending page content')
    toastStore.addToast('sending page content', 'info')
    // messenger.sendMessage('pageContent', 'hello')

    return

    const baseUrl = 'https://developer.chrome.com/docs/extensions'

    const linksToFind = new Set<string>([baseUrl])
    const knownLinks = new Set<string>(await documentDB.keys())

    for (let index = 0; index < linksToFind.size; index++) {
      const link = Array.from(linksToFind.values())[index]

      await extractLinks(link, baseUrl, knownLinks, linksToFind)
      console.log('finding links: ', linksToFind)
    }

    console.log('found links: ', knownLinks)
  }

  const extractData = async (url: string) => {
    const loader = new CheerioWebBaseLoader(url)

    const $ = await loader.scrape()

    // inspired by page-assist
    const mainContent = $('[role="main"]').html() || $('main').html() || $('body').html() || ''

    return convert(mainContent)
  }

  const extractLinks = async (
    url: string,
    baseUrl: string,
    knownLinks: Set<string>,
    linksToFind: Set<string>,
  ) => {
    if (knownLinks.has(url)) return

    knownLinks.add(url)

    try {
      const loader = new CheerioWebBaseLoader(url)

      const $ = await loader.scrape()

      // inspired by page-assist
      const mainContent = $('[role="main"]').html() || $('main').html() || $('body').html() || ''

      const readableContent = convert(mainContent)

      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      })

      const documents = await textSplitter.createDocuments([readableContent])

      await documentDB.setItem(url, documents)

      // Select all anchor tags and extract href attributes
      $('a').each((_index, element) => {
        const href = $(element).attr('href')
        // Make sure the href attribute exists and is not empty
        if (href && href.trim() !== '' && href.startsWith(baseUrl)) {
          linksToFind.add(convertUrl(baseUrl, href))
        }
      })
    } catch (error) {
      console.error('Error fetching or parsing the webpage:', url, error)
      return []
    }
  }

  const convertUrl = (baseUrl: string, path: string) => {
    let url

    if (path.startsWith('/')) {
      url = _.trimEnd(baseUrl, '/') + path
    } else {
      url = path
    }

    url = url.split('?')[0]
    url = url.split('#')[0]

    return _.trimEnd(url, '/')
  }

  const loadRepo = async () => {
    const loader = new GithubRepoLoader('https://github.com/mrdjohnson/llm-x', {
      branch: 'main',
      recursive: true,
      unknown: 'warn',
    })
    const docs = await loader.load()
    console.log({ docs })
  }

  return (
    <div className="flex max-h-full min-h-full w-full min-w-full max-w-full flex-col overflow-x-auto overflow-y-hidden rounded-md">
      <ScrollableChatFeed className="no-scrollbar flex flex-1 flex-col gap-2 overflow-x-hidden">
        {chat.messages.length > 0 ? (
          chat.messages.map(message => (
            <ChatBoxMessage
              key={message.selectedVariation.id}
              message={message}
              disableRegeneration={isGettingData}
              disableEditing={isEditingMessage}
              shouldDimMessage={isEditingMessage}
              shouldScrollIntoView={message.selectedVariation.id === lightboxMessageId}
              variationIdToEdit={variationIdToEdit}
            />
          ))
        ) : (
          <ChatBoxPrompt />
        )}
      </ScrollableChatFeed>
      {/* <button onClick={findLinks}>find links</button>
      <button
        onClick={() => {
          console.log('do something')
        }}
      >
        find links2
      </button> */}

      <ToastCenter />

      <ChatBoxInputRow chat={chat} onSend={handleMessageToSend}>
        {isGettingData && (
          <button
            type="button"
            className="btn btn-ghost btn-md my-1 h-fit min-h-0 rounded-md !bg-transparent px-[2.5px] text-error/50 hover:scale-110 hover:text-error"
            onClick={handleMessageStopped}
          >
            <Stop />
          </button>
        )}
      </ChatBoxInputRow>

      {!isSidebarOpen && <ModelAndPersonaDisplay />}
    </div>
  )
}

export default ChatBox
