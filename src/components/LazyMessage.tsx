import React, { Suspense, useCallback, useEffect, useMemo, useRef } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { type PropsWithChildren } from 'react'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'

import Delete from '~/icons/Delete'
import Refresh from '~/icons/Refresh'
import ChevronDown from '~/icons/ChevronDown'
import Edit from '~/icons/Edit'

import { chatStore } from '~/models/ChatStore'
import { incomingMessageStore } from '~/models/IncomingMessageStore'

import { lightboxStore } from '~/features/lightbox/LightboxStore'

import { MessageProps } from '~/components/Message'
import CopyButton from '~/components/CopyButton'
import CachedImage from '~/components/CachedImage'

const CustomCodeBlock = React.lazy(() => import('./CustomCodeBlock'))

const DelayedCustomCodeBlock = (props: PropsWithChildren) => {
  return (
    <Suspense fallback={<code {...props} className="not-prose bg-transparent" />}>
      <CustomCodeBlock {...props} />
    </Suspense>
  )
}

const LazyMessage = observer(
  ({
    message,
    onDestroy,
    children,
    customDeleteIcon,
    disableRegeneration,
    disableEditing,
    shouldDimMessage,
    shouldScrollIntoView,
  }: MessageProps) => {
    const { content, fromBot, uniqId, extras, imageUrls } = message
    const error = extras?.error
    const chat = chatStore.selectedChat!

    const containerRef = useRef<HTMLDivElement>(null)

    const handleRegeneration = async () => {
      incomingMessageStore.generateMessage(chat, message)
    }

    const handleEdit = async () => {
      chatStore.selectedChat!.setMessageToEdit(message)
    }

    const extraButtons = useMemo(() => {
      if (chat.isEditingMessage || incomingMessageStore.isGettingData) return null

      return (
        <>
          <button
            className="rounded-md text-base-content/30 hover:scale-125 hover:text-base-content"
            onClick={handleEdit}
            disabled={disableEditing}
            title="Edit message"
          >
            <Edit className="h-4 w-4" />
          </button>

          {fromBot && (
            <button
              className="rounded-md text-base-content/30 hover:scale-125 hover:text-base-content"
              onClick={handleRegeneration}
              disabled={disableRegeneration}
              title={customDeleteIcon ? 'Stop' : 'Regenerate message'}
            >
              {customDeleteIcon || <Refresh />}
            </button>
          )}
        </>
      )
    }, [chat, fromBot, disableRegeneration, disableEditing])

    // every 300ms try to scroll to the bottom of the component
    // throttling allows the previous animation to try and finish
    const scrollIntoView = useCallback(
      _.throttle(() => {
        containerRef.current?.scrollIntoView({
          behavior: 'smooth',

          // bottom of the component
          block: 'end',
          inline: 'nearest',
        })
      }, 300),
      [],
    )

    // we should scroll into view when:
    // - we get a message to edit (by user or bot)
    // - the content of that message is updated (by bot)
    // - the message has an image in view
    useEffect(() => {
      if (shouldScrollIntoView) {
        scrollIntoView()
      }
    }, [shouldScrollIntoView, content])

    const hasInnerContent = children || content || error

    return (
      <div
        className={
          'group indicator relative flex w-fit min-w-6 max-w-full scroll-m-5 flex-col ' +
          (fromBot ? 'pr-4 lg:pr-8' : ' self-end pl-4 lg:pl-8 ') +
          (shouldDimMessage ? ' opacity-55 ' : '') +
          (children ? ' mt-2 ' : '')
        }
        key={uniqId}
        ref={containerRef}
      >
        {message.botName && <span className="opacity-30">{message.botName}</span>}

        {imageUrls && (
          <div className="mb-2 flex flex-row flex-wrap place-content-stretch gap-2">
            {imageUrls.map(imageUrl => (
              <button
                key={imageUrl}
                className="h-56 place-content-center overflow-hidden rounded-md border border-base-content/30 bg-base-content/30"
                onClick={() => lightboxStore.setLightboxMessageById(message.uniqId, imageUrl)}
              >
                <CachedImage
                  className="max-h-56 min-w-20 max-w-56 rounded-md object-contain object-center"
                  style={{ maskSize: 'cover' }}
                  src={imageUrl}
                />
              </button>
            ))}
          </div>
        )}

        {hasInnerContent && (
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
                className="prose-spacing prose flex w-full flex-wrap overflow-x-hidden overscroll-none prose-p:w-full"
                components={{
                  code: DelayedCustomCodeBlock,
                }}
              >
                {content.replace(/\n/g, '  \n')}
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
        )}

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

          <CopyButton
            className="place-items-center rounded-md text-base-content/30 hover:scale-125 hover:text-base-content"
            text={content}
          />

          {extraButtons}
        </div>
      </div>
    )
  },
)

export default LazyMessage
