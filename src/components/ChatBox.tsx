import { useEffect, useRef, useState, useCallback, PropsWithChildren } from 'react'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import ScrollableFeed from 'react-scrollable-feed'

import { chatStore } from '../models/ChatStore'
import { settingStore } from '../models/SettingStore'

import { IncomingMessage, Message } from './Message'
import { OllmaApi } from '../utils/OllamaApi'

const ChatBoxInputRow = observer(
  ({ onSend, children }: PropsWithChildren<{ onSend: (message: string) => void }>) => {
    const [userMessage, setUserMessage] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)

    const handleSend = () => {
      onSend(userMessage)
      setUserMessage('')

      inputRef.current?.focus()
    }

    const handleKeyPress = (keyEvent: React.KeyboardEvent<HTMLInputElement>) => {
      if (keyEvent.key === 'Enter') {
        handleSend()
      }
    }

    const noServer = !settingStore.selectedModel

    return (
      <div className={'' + (noServer && 'tooltip')} data-tip="Server is not connected">
        <form className="flex flex-row min-h-fit mt-2 gap-2 ">
          <input
            placeholder="Enter Prompt"
            className="input grow input-bordered focus:outline-none w-full"
            onChange={e => setUserMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            value={userMessage}
            ref={inputRef}
            type="text"
            disabled={chatStore.isGettingData || noServer}
          />

          {children || (
            <button className="btn btn-neutral" onClick={handleSend} disabled={noServer}>
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

  const handleMessageToSend = (userMessage: string) => {
    if (!userMessage) return
    chat.addUserMessage(userMessage)

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
