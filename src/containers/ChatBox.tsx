import { MouseEvent, useEffect } from 'react'
import _ from 'lodash'

import { chatStore } from '~/core/chat/ChatStore'
import { incomingMessageStore } from '~/core/IncomingMessageStore'
import { actorStore } from '~/core/actor/ActorStore'

import ChatBoxInputRow from '~/components/ChatBoxInputRow'
import ChatBoxPrompt from '~/components/ChatBoxPrompt'
import ToastCenter from '~/components/ToastCenter'

import Stop from '~/icons/Stop'

import { lightboxStore } from '~/features/lightbox/LightboxStore'
import { ChatBoxMessage } from '~/components/message/ChatBoxMessage'
import { settingStore } from '~/core/setting/SettingStore'
import ScrollableChatFeed from '~/containers/ScrollableChatFeed'
import ModelAndPersonaDisplay from '~/components/ModelAndPersonaDisplay'

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
