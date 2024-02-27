import React, { Suspense } from 'react'
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

type MessageProps = PropsWithChildren<{
  message: IMessageModel
  loading?: boolean
  onDestroy: () => void
  customDeleteIcon?: React.ReactNode
  disableRegeneration?: boolean
}>

export const Message = ({
  message,
  onDestroy,
  children,
  customDeleteIcon,
  disableRegeneration,
}: MessageProps) => {
  const { content, fromBot, uniqId, image, extras } = message
  const error = extras?.error

  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleRegeneration = async () => {
    chatStore.selectedChat!.generateMessage(message)
  }

  return (
    <div
      className={
        'group indicator flex w-fit min-w-6 max-w-full flex-col ' +
        (fromBot ? 'pr-6 ' : ' ml-2 self-end ')
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
          'mt-1 flex w-fit flex-row gap-2 opacity-0 group-hover:opacity-90 ' +
          (!fromBot && 'self-end')
        }
      >
        <button className="rounded-md text-error/30 hover:text-error" onClick={onDestroy}>
          {customDeleteIcon || <Delete />}
        </button>

        <button
          className="rounded-md text-base-content/30 hover:text-base-content"
          onClick={handleCopy}
        >
          <label className={'swap ' + (copied && 'swap-active')}>
            <Copy className="swap-off" />
            <CopySuccess className="swap-on" />
          </label>
        </button>

        {!children && fromBot && (
          <button
            className="rounded-md text-base-content/30 hover:text-base-content"
            onClick={handleRegeneration}
            disabled={disableRegeneration}
          >
            {customDeleteIcon || <Refresh />}
          </button>
        )}
      </div>
    </div>
  )
}
