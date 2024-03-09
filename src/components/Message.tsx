import React, { Suspense, useMemo } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { PropsWithChildren, useState } from 'react'
import { observer } from 'mobx-react-lite'

import Delete from '../icons/Delete'
import Copy from '../icons/Copy'
import CopySuccess from '../icons/CopySuccess'
import Stop from '../icons/Stop'
import Refresh from '../icons/Refresh'
import ChevronDown from '../icons/ChevronDown'
import Edit from '../icons/Edit'

import { IMessageModel } from '../models/MessageModel'
import { chatStore } from '../models/ChatStore'

const CustomCodeBlock = React.lazy(() => import('./CustomCodeBlock'))

const DelayedCustomCodeBlock = (props: PropsWithChildren) => {
  return (
    <Suspense fallback={<code {...props} className="not-prose bg-transparent" />}>
      <CustomCodeBlock {...props} />
    </Suspense>
  )
}

const Loading = () => (
  <span className="indicator-item loading loading-dots loading-sm indicator-start ml-8" />
)

// this one is observed for incoming text changes, the rest do not need to be observed
export const IncomingMessage = observer(() => {
  const chat = chatStore.selectedChat!
  const incomingMessage = chat.incomingMessage

  // show an empty loading box when we are getting a message from the server
  // checking for content also tells the observer to re-render
  if (incomingMessage?.content === undefined) return null

  return (
    <Message
      message={incomingMessage}
      onDestroy={chat.abortGeneration}
      customDeleteIcon={<Stop />}
      disableRegeneration
    >
      <Loading />
    </Message>
  )
})

export const MessageToEdit = observer(({ message }: { message: IMessageModel }) => {
  const chat = chatStore.selectedChat!

  return (
    <Message
      message={message}
      onDestroy={() => chat.setMessageToEdit(undefined)}
      customDeleteIcon={<Stop />}
      shouldDimMessage={false}
    >
      <Loading />
    </Message>
  )
})

type MessageProps = PropsWithChildren<{
  message: IMessageModel
  loading?: boolean
  onDestroy: () => void
  customDeleteIcon?: React.ReactNode
  disableRegeneration?: boolean
  disableEditing?: boolean
  shouldDimMessage?: boolean
}>

export const Message = ({
  message,
  onDestroy,
  children,
  customDeleteIcon,
  disableRegeneration,
  disableEditing,
  shouldDimMessage,
}: MessageProps) => {
  const { content, fromBot, uniqId, image, extras } = message
  const error = extras?.error
  const chat = chatStore.selectedChat!

  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleRegeneration = async () => {
    chatStore.selectedChat!.generateMessage(message)
  }

  const handleEdit = async () => {
    chatStore.selectedChat!.setMessageToEdit(message)
  }

  const extraButton = useMemo(() => {
    if (chat.isEditingMessage || chat.isGettingData) return null

    if (fromBot) {
      return (
        <button
          className="rounded-md text-base-content/30 hover:scale-125 hover:text-base-content"
          onClick={handleRegeneration}
          disabled={disableRegeneration}
          title={customDeleteIcon ? 'Stop' : 'Regenerate message'}
        >
          {customDeleteIcon || <Refresh />}
        </button>
      )
    }

    return (
      <button
        className="rounded-md text-base-content/30 hover:scale-125 hover:text-base-content"
        onClick={handleEdit}
        disabled={disableEditing}
        title="Edit message"
      >
        <Edit className="h-4 w-4" />
      </button>
    )
  }, [chat, fromBot, disableRegeneration, disableEditing])

  if (!message.content && !error) return null

  return (
    <div
      className={
        'group indicator relative flex w-fit min-w-6 max-w-full flex-col ' +
        (fromBot ? 'pr-6 ' : ' ml-2 self-end ') +
        (shouldDimMessage ? ' opacity-55 ' : '')
      }
      key={uniqId}
    >
      {children}

      {image && (
        <img className="h-56 w-56 place-self-center rounded-md object-contain" src={image} />
      )}

      <div className="join join-vertical border border-base-content/20">
        <div
          className={
            'w-full p-2 ' +
            (children ? 'min-w-16 ' : '') +
            (error ? 'join-item border-b-0' : 'rounded-md')
          }
        >
          <Markdown
            remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
            className="prose inline-table w-full"
            components={{
              code: DelayedCustomCodeBlock,
            }}
          >
            {content}
          </Markdown>
        </div>

        {error && (
          <div
            className="group/error collapse join-item transition-all duration-300 ease-in-out"
            tabIndex={0}
          >
            <div className="collapse-title line-clamp-1 flex max-h-8 min-h-0 flex-row flex-nowrap bg-error/30 p-2 text-xs font-medium">
              {error.message}

              <span className="ml-2 scale-90 transition-all duration-300 ease-in-out group-focus/error:rotate-180">
                <ChevronDown />
              </span>
            </div>

            {error.stack && (
              <div className="collapse-content">
                <p className="whitespace-pre-line pt-2 text-xs">{error.stack}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div
        className={
          'sticky bottom-0 mx-2 mt-1 flex w-fit gap-2 rounded-md opacity-0 group-hover:opacity-90 ' +
          (fromBot ? 'flex-row' : 'flex-row-reverse self-end')
        }
      >
        <button
          className="rounded-md text-error/30 hover:scale-125 hover:text-error"
          onClick={onDestroy}
          title={customDeleteIcon ? 'Stop' : 'Delete'}
        >
          {customDeleteIcon || <Delete />}
        </button>

        <button
          className="place-items-center rounded-md text-base-content/30 hover:scale-125 hover:text-base-content"
          onClick={handleCopy}
          title="Copy contents to clipboard"
        >
          <label className={'swap h-full ' + (copied && 'swap-active')}>
            <Copy className="swap-off" />
            <CopySuccess className="swap-on" />
          </label>
        </button>

        {extraButton}
      </div>
    </div>
  )
}
