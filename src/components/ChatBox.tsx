import { useEffect, useRef, useState, useCallback, PropsWithChildren } from 'react'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import ScrollableFeed from 'react-scrollable-feed'

import { chatStore } from '../models/ChatStore'
import { settingStore } from '../models/SettingStore'

import { IncomingMessage, Message } from './Message'
import { OllmaApi } from '../utils/OllamaApi'
import Paperclip from '../icons/Paperclip'
import base64EncodeImage from '../utils/base64EncodeImage'

const ChatBoxInputRow = observer(
  ({
    onSend,
    children,
  }: PropsWithChildren<{ onSend: (message: string, image?: string) => void }>) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [previewImage, setPreviewImage] = useState<string | undefined>(undefined)
    const [toastMessage, setToastMessage] = useState<string | undefined>(undefined)

    const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      if (!inputRef.current) return

      const userMessage = inputRef.current.value || ''

      onSend(userMessage, previewImage)

      inputRef.current.value = ''
      inputRef.current.focus()

      setPreviewImage(undefined)
    }

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const fileObj = event.target.files?.[0]
      if (!fileObj) {
        return
      }

      // reset file input
      event.target.value = ''

      try {
        const imageData = await base64EncodeImage(fileObj)

        setPreviewImage(imageData)
      } catch (e) {
        setToastMessage('Unable to read image')

        setTimeout(() => {
          setToastMessage(undefined)
        }, 3000)
      }
    }

    const noServer = !settingStore.selectedModel

    return (
      <div className={'w-full mt-2 ' + (noServer && 'tooltip')} data-tip="Server is not connected">
        <form className="flex flex-row min-h-fit gap-2 w-full" onSubmit={onFormSubmit}>
          <div className="join w-full flex-1 relative">
            <input
              className="input input-bordered join-item grow focus:outline-none"
              placeholder="Enter Prompt"
              ref={inputRef}
              type="text"
              disabled={chatStore.isGettingData || noServer}
            />

            {/* hidden file input */}
            <input
              style={{ display: 'none' }}
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
            />

            <button
              className="btn join-item !rounded-r-md border input-bordered hover:input-bordered"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip />
            </button>

            {previewImage && (
              <div className="h-24 w-24 absolute --top-full end-0 bottom-full mb-2">
                <div className="relative h-full w-full">
                  <div
                    className="absolute top-1 right-1 opacity-70 btn btn-xs"
                    onClick={() => setPreviewImage(undefined)}
                  >
                    x
                  </div>

                  <img src={previewImage} className="object-fit h-24 w-24 rounded-md" />
                </div>
              </div>
            )}
          </div>

          {children || (
            <button className="btn btn-neutral" disabled={noServer}>
              Send
            </button>
          )}
        </form>

        {toastMessage && (
          <div className="toast toast-center">
            <div className="alert alert-error text-xl font-bold rounded-md">
              <span>{toastMessage}</span>
            </div>
          </div>
        )}
      </div>
    )
  },
)

const ChatBox = observer(() => {
  const chat = chatStore.selectedChat

  const scrollableFeedRef = useRef<ScrollableFeed>(null)

  const sendMessage = async () => {
    if (!chat) return

    try {
      for await (const message of OllmaApi.streamChat()) {
        chat.updateIncomingMessage(message)
        scrollToBottom()
      }
    } catch (e) {
      // TODO: do not add this to the text but instead make it a boolean failed
      chat.updateIncomingMessage('\n -- Communication stopped with server --')
    } finally {
      chat.commitIncomingMessage()

      scrollableFeedRef.current?.scrollToBottom()
    }
  }

  //  only scroll every 1.5 seconds max
  const scrollToBottom = useCallback(
    _.throttle(() => {
      console.log('scrolling to bottom')
      scrollableFeedRef.current?.scrollToBottom()
    }, 1500),
    [scrollableFeedRef?.current],
  )

  useEffect(() => {
    //no op

    //cleanup
    return OllmaApi.cancelStream
  }, [])

  if (!chat) return null

  const handleMessageToSend = (userMessage: string, image?: string) => {
    console.timeLog('handling message')
    chat.addUserMessage(userMessage, image)

    sendMessage()
  }

  return (
    <div className="rounded-md flex flex-col min-h-full max-h-full w-full max-w-full overflow-x-auto overflow-y-scroll min-w-full">
      <ScrollableFeed
        ref={scrollableFeedRef}
        className="flex flex-col gap-2 flex-1 no-scrollbar overflow-x-hidden overflow-y-scroll"
        animateScroll={(element, offset) => element.scrollBy({ top: offset, behavior: 'smooth' })}
      >
        {chat.messages.map(message => (
          <Message
            message={message}
            key={message.uniqId}
            onDestroy={() => chat.deleteMessage(message.uniqId)}
          />
        ))}

        {chat.isGettingData && <IncomingMessage />}
      </ScrollableFeed>

      <ChatBoxInputRow onSend={handleMessageToSend}>
        {chat.isGettingData && (
          <button className="btn btn-outline btn-error opacity-40" onClick={OllmaApi.cancelStream}>
            Stop
          </button>
        )}
      </ChatBoxInputRow>
    </div>
  )
})

export default ChatBox
