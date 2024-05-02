import { useRef, MouseEvent, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import ScrollableFeed from 'react-scrollable-feed'
import _ from 'lodash'

import { chatStore } from '~/models/ChatStore'
import { IMessageModel } from '~/models/MessageModel'
import { incomingMessageStore } from '~/models/IncomingMessageStore'

import ChatBoxInputRow from '~/components/ChatBoxInputRow'
import ChatBoxPrompt from '~/components/ChatBoxPrompt'
import { IncomingMessage, Message, MessageToEdit } from '~/components/Message'
import MessageGroup from '~/components/message/MessageGroup'

import { lightboxStore } from '~/features/lightbox/LightboxStore'

const ChatBox = observer(() => {
  const chat = chatStore.selectedChat

  const scrollableFeedRef = useRef<ScrollableFeed>(null)

  useEffect(() => {
    setTimeout(() => {
      scrollableFeedRef.current?.scrollToBottom()
    }, 300)
  }, [chat])

  if (!chat) return null

  const handleMessageToSend = async (userMessageContent: string, imageUrls?: string[]) => {
    if (chat.messageToEdit) {
      await chat.commitMessageToEdit(userMessageContent, imageUrls)

      if (chat.messageToEdit.fromBot) {
        chat.setMessageToEdit(undefined)
      } else {
        chat.findAndRegenerateResponse()
      }
    } else {
      await chat.addUserMessage(userMessageContent, imageUrls)

      const incomingMessage = chat.createAndPushIncomingMessage()

      incomingMessageStore.generateMessage(chat, incomingMessage).finally(() => {
        scrollableFeedRef.current?.scrollToBottom()
      })
    }
  }

  const handleMessageStopped = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    incomingMessageStore.abortGeneration()
  }

  const isGettingData = incomingMessageStore.isGettingData
  const isEditingMessage = chat.isEditingMessage
  const outgoingUniqId = chat.messageToEdit?.uniqId
  const outgoingVariantUniqId = chat.messageVariantToEdit?.uniqId
  const lightboxMessageId = lightboxStore.lightboxMessage?.uniqId

  const renderMessage = (message: IMessageModel, variant: IMessageModel, variantIndex?: number) => {
    if (incomingMessageStore.contains(variant)) {
      return <IncomingMessage key={variant.uniqId} message={message} messageVariant={variant} />
    }

    if (message.uniqId === outgoingUniqId && variant.uniqId === outgoingVariantUniqId) {
      return <MessageToEdit key={variant.uniqId} message={message} messageVariant={variant} />
    }

    const handleDestroy = () => {
      if (_.isNil(variantIndex)) {
        // single view
        message.selfDestruct()
      } else if (_.gt(variantIndex, 0)) {
        // group view
        variant.selfDestruct()
      }

      // group view, original message
      return undefined
    }

    return (
      <Message
        message={message}
        messageVariant={variant}
        variationIndex={variantIndex}
        key={variant.uniqId}
        onDestroy={handleDestroy}
        disableRegeneration={isGettingData}
        disableEditing={isEditingMessage}
        shouldDimMessage={isEditingMessage}
        shouldScrollIntoView={message.uniqId === lightboxMessageId}
      />
    )
  }

  const renderMessageOrGroup = (message: IMessageModel) => {
    if (!message.showVariations) return renderMessage(message, message.selectedVariation)

    const variations: IMessageModel[] = message.variations
    const allVariations = [message, ...variations]

    return (
      <MessageGroup message={message} key={message.uniqId + '_group'}>
        {allVariations.map((variant, index) => renderMessage(message, variant, index))}
      </MessageGroup>
    )
  }

  return (
    <div className="flex max-h-full min-h-full w-full min-w-full max-w-full flex-col overflow-x-auto overflow-y-hidden rounded-md">
      <ScrollableFeed
        ref={scrollableFeedRef}
        className={
          'no-scrollbar flex flex-1 flex-col gap-2 overflow-x-hidden' +
          (isEditingMessage || isGettingData ? ' !overflow-y-hidden ' : '')
        }
        animateScroll={(element, offset) => element.scrollBy({ top: offset, behavior: 'smooth' })}
      >
        {chat.messages.length > 0 ? chat.messages.map(renderMessageOrGroup) : <ChatBoxPrompt />}
      </ScrollableFeed>

      <ChatBoxInputRow onSend={handleMessageToSend}>
        {isGettingData && (
          <button
            type="button"
            className="btn btn-ghost rounded-none rounded-br-md text-error/50 hover:text-error"
            onClick={handleMessageStopped}
          >
            Stop
          </button>
        )}
      </ChatBoxInputRow>
    </div>
  )
})

export default ChatBox
