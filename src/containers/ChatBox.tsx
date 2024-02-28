import { useRef, PropsWithChildren, MouseEvent, useEffect, useState } from 'react'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import ScrollableFeed from 'react-scrollable-feed'

import { chatStore } from '../models/ChatStore'
import { settingStore } from '../models/SettingStore'
import { IMessageModel } from '../models/MessageModel'

import { IncomingMessage, Message, MessageToEdit } from '../components/Message'
import Paperclip from '../icons/Paperclip'

const ChatBoxInputRow = observer(
  ({
    onSend,
    children,
  }: PropsWithChildren<{ onSend: (message: string, image?: string) => void }>) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [messageContent, setMessageContent] = useState('')

    const chat = chatStore.selectedChat!
    const { previewImage, messageToEdit } = chat

    const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      if (!inputRef.current) return

      const userMessage = inputRef.current.value || ''

      onSend(userMessage, previewImage)

      inputRef.current.value = ''
      inputRef.current.focus()

      chat.setPreviewImage(undefined)
    }

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]

      if (!file) {
        return
      }

      // reset file input
      event.target.value = ''

      chat.setPreviewImage(file)
    }

    const noServer = !settingStore.selectedModel
    const inputDisabled = chatStore.isGettingData || noServer

    useEffect(() => {
      if (!inputRef.current) return

      setMessageContent(messageToEdit?.content || '')
    }, [messageToEdit])

    return (
      <div className={'mt-2 w-full ' + (noServer && 'tooltip')} data-tip="Server is not connected">
        <form className="flex min-h-fit w-full flex-row gap-2" onSubmit={onFormSubmit}>
          <div className="join relative w-full flex-1">
            <input
              className="input join-item input-bordered grow focus:outline-none"
              placeholder="Enter Prompt"
              ref={inputRef}
              type="text"
              disabled={inputDisabled}
              value={messageContent}
              onChange={e => setMessageContent(e.target.value)}
            />

            {/* hidden file input */}
            <input
              style={{ display: 'none' }}
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />

            <button
              className={
                'btn join-item !rounded-r-md border ' +
                (inputDisabled ? '' : 'input-bordered hover:input-bordered')
              }
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={inputDisabled}
            >
              <Paperclip />
            </button>

            {previewImage && (
              <div className="--top-full absolute bottom-full end-0 mb-2 h-24 w-24">
                <div className="relative h-full w-full">
                  <div
                    className="btn btn-xs absolute right-1 top-1 opacity-70"
                    onClick={() => chat.setPreviewImage(undefined)}
                  >
                    x
                  </div>

                  <img src={previewImage} className="object-fit h-24 w-24 rounded-md" />
                </div>
              </div>
            )}
          </div>

          {chat.isEditingMessage && (
            <button
              className="btn btn-outline btn-error opacity-40"
              type="button"
              disabled={noServer}
              onClick={() => chat.setMessageToEdit(undefined)}
            >
              Cancel
            </button>
          )}

          {children || (
            <button className="btn btn-neutral" disabled={noServer || _.isEmpty(messageContent)}>
              Send
            </button>
          )}
        </form>
      </div>
    )
  },
)

const ChatBox = observer(() => {
  const chat = chatStore.selectedChat

  const scrollableFeedRef = useRef<ScrollableFeed>(null)

  const sendMessage = async (incomingMessage: IMessageModel) => {
    if (!chat) return

    chat.generateMessage(incomingMessage).finally(() => {
      scrollableFeedRef.current?.scrollToBottom()
    })
  }

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
      />
    )
  }

  return (
    <div className="flex max-h-full min-h-full w-full min-w-full max-w-full flex-col overflow-x-auto overflow-y-hidden rounded-md">
      <ScrollableFeed
        ref={scrollableFeedRef}
        className="no-scrollbar flex flex-1 flex-col gap-2 overflow-x-hidden overflow-y-hidden"
        animateScroll={(element, offset) => element.scrollBy({ top: offset, behavior: 'smooth' })}
      >
        {chat.messages.map(renderMessage)}
      </ScrollableFeed>

      <ChatBoxInputRow onSend={handleMessageToSend}>
        {chat.isGettingData && (
          <button
            type="button"
            className="btn btn-outline btn-error opacity-40"
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
