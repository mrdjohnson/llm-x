import React, { Suspense, useEffect, useMemo, useRef } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { PropsWithChildren, useState } from 'react'

import Delete from '../icons/Delete'
import Copy from '../icons/Copy'
import CopySuccess from '../icons/CopySuccess'
import Refresh from '../icons/Refresh'
import ChevronDown from '../icons/ChevronDown'
import Edit from '../icons/Edit'

import { chatStore } from '../models/ChatStore'
import { MessageProps } from './Message'

const CustomCodeBlock = React.lazy(() => import('./CustomCodeBlock'))

const DelayedCustomCodeBlock = (props: PropsWithChildren) => {
  return (
    <Suspense fallback={<code {...props} className="not-prose bg-transparent" />}>
      <CustomCodeBlock {...props} />
    </Suspense>
  )
}

const LazyMessage = ({
  message,
  onDestroy,
  children,
  customDeleteIcon,
  disableRegeneration,
  disableEditing,
  shouldDimMessage,
  shouldScrollIntoView,
}: MessageProps) => {
  const { content, fromBot, uniqId, image, extras } = message
  const error = extras?.error
  const chat = chatStore.selectedChat!

  const containerRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    if (shouldScrollIntoView) {
      containerRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [shouldScrollIntoView])

  return (
    <div
      className={
        'group indicator relative flex w-fit min-w-6 max-w-full scroll-m-5 flex-col ' +
        (fromBot ? 'pr-4 lg:pr-8' : ' ml-2 self-end ') +
        (shouldDimMessage ? ' opacity-55 ' : '') +
        (children ? ' mt-2 ' : '')
      }
      key={uniqId}
      ref={containerRef}
    >
      {image && (
        <img
          className="mb-2 h-56 max-w-56 place-self-center rounded-md object-contain"
          src={image}
        />
      )}

      {message.botName && <span className="opacity-30">{message.botName}</span>}

      <div className="join join-vertical relative min-h-10 border border-base-content/20">
        {children}

        <div
          className={
            'w-full p-2 ' +
            (children ? 'min-w-16 ' : '') +
            (error ? 'join-item border-b-0' : 'rounded-md')
          }
        >
          <Markdown
            remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
            className="prose flex w-full flex-wrap overflow-x-hidden overscroll-none"
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

export default LazyMessage
