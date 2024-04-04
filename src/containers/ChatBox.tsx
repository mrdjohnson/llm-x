import { useRef, MouseEvent, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import ScrollableFeed from 'react-scrollable-feed'

import { chatStore } from '~/models/ChatStore'
import { IMessageModel } from '~/models/MessageModel'

import ChatBoxInputRow from '~/components/ChatBoxInputRow'
import ChatBoxPrompt from '~/components/ChatBoxPrompt'
import { IncomingMessage, Message, MessageToEdit } from '~/components/Message'

const ChatBox = observer(() => {
  const chat = chatStore.selectedChat

  const scrollableFeedRef = useRef<ScrollableFeed>(null)

  const sendMessage = async (incomingMessage: IMessageModel) => {
    if (!chat) return

    chat.generateMessage(incomingMessage).finally(() => {
      scrollableFeedRef.current?.scrollToBottom()
    })
  }

  useEffect(() => {
    setTimeout(() => {
      scrollableFeedRef.current?.scrollToBottom()
    }, 300)
  }, [chat])

  if (!chat) return null

  const handleMessageToSend = (userMessageContent: string, image?: string) => {
    console.timeLog('handling message')

    if (chat.messageToEdit) {
      chat.commitMessageToEdit(userMessageContent, image)

      chat.findAndRegenerateResponse()
    } else {
      chat.addUserMessage(userMessageContent, image)

      const incomingMessage = chat.createAndPushIncomingMessage()
      sendMessage(incomingMessage)
    }
  }

  const handleMessageStopped = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    chat.abortGeneration()
  }

  const disableRegeneration = !!chat.incomingMessage
  const isEditingMessage = chat.isEditingMessage
  const incomingUniqId = chat.incomingMessage?.uniqId
  const outgoingUniqId = chat.messageToEdit?.uniqId
  const lightboxMessageId = chat.lightboxMessage?.uniqId

  const renderMessage = (message: IMessageModel) => {
    if (message.uniqId === incomingUniqId) return <IncomingMessage key={message.uniqId} />

    if (message.uniqId === outgoingUniqId)
      return <MessageToEdit key={message.uniqId} message={message} />

    return (
      <Message
        message={message}
        key={message.uniqId}
        onDestroy={() => chat.deleteMessage(message)}
        disableRegeneration={disableRegeneration}
        disableEditing={isEditingMessage}
        shouldDimMessage={isEditingMessage}
        shouldScrollIntoView={message.uniqId === lightboxMessageId}
      />
    )
  }

  return (
    <div className="flex max-h-full min-h-full w-full min-w-full max-w-full flex-col overflow-x-auto overflow-y-hidden rounded-md">
      <ScrollableFeed
        ref={scrollableFeedRef}
        className={
          'no-scrollbar flex flex-1 flex-col gap-2 overflow-x-hidden' +
          (isEditingMessage || incomingUniqId ? ' !overflow-y-hidden ' : '')
        }
        animateScroll={(element, offset) => element.scrollBy({ top: offset, behavior: 'smooth' })}
      >
        {chat.messages.length > 0 ? chat.messages.map(renderMessage) : <ChatBoxPrompt />}
      </ScrollableFeed>

      <ChatBoxInputRow onSend={handleMessageToSend}>
        {chat.isGettingData && (
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
