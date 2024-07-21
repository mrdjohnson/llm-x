import React, { Suspense, useCallback, useEffect, useMemo, useRef } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { type PropsWithChildren } from 'react'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { useSpeech } from 'react-text-to-speech'
import { Badge, ScrollShadow } from '@nextui-org/react'

import Delete from '~/icons/Delete'
import Refresh from '~/icons/Refresh'
import ChevronDown from '~/icons/ChevronDown'
import Edit from '~/icons/Edit'
import Warning from '~/icons/Warning'
import WindowCheck from '~/icons/WindowCheck'
import PlayPause from '~/icons/PlayPause'
import Stop from '~/icons/Stop'

import { chatStore } from '~/models/ChatStore'
import { incomingMessageStore } from '~/models/IncomingMessageStore'
import { IMessageModel } from '~/models/MessageModel'
import { settingStore } from '~/models/SettingStore'

import { lightboxStore } from '~/features/lightbox/LightboxStore'

import { MessageProps } from '~/components/Message'
import CopyButton from '~/components/CopyButton'
import CachedImage from '~/components/CachedImage'
import ToolTip from '~/components/Tooltip'
import MessageVariationSelectionRow from '~/components/message/MessageVariationSelectionRow'
import CustomMathBlock from './CustomMathBlock'

const CustomCodeBlock = React.lazy(() => import('./CustomCodeBlock'))

const DelayedCustomCodeBlock = (props: PropsWithChildren) => {
  return (
    <Suspense fallback={<code {...props} className="not-prose bg-transparent" />}>
      <CustomCodeBlock {...props} />
    </Suspense>
  )
}

const DetailsToolTip = observer(({ message }: { message: IMessageModel }) => {
  const details = JSON.stringify(message.extras!.details, null, 2)

  return (
    <div className="flex flex-col gap-1 overflow-scroll pt-1">
      <Badge
        content={
          <CopyButton
            className="text-base-content/30 hover:scale-125 hover:text-base-content"
            text={details}
          />
        }
        classNames={{
          badge: 'bg-transparent border-none',
        }}
      >
        <ScrollShadow className="w-fit max-w-[80vw]" orientation="horizontal">
          <pre className="text-sm">{details}</pre>
        </ScrollShadow>
      </Badge>
    </div>
  )
})

const LazyMessage = observer(
  ({
    message: baseMessage,
    messageVariant,
    onDestroy,
    children,
    customDeleteIcon,
    disableRegeneration,
    disableEditing,
    shouldDimMessage,
    shouldScrollIntoView,
    variationIndex,
  }: MessageProps) => {
    const isVariationGroupView = variationIndex !== undefined
    const message = messageVariant || baseMessage

    const { content, fromBot, uniqId, extras, imageUrls, botName } = message
    const error = extras?.error
    const details = extras?.details
    const chat = chatStore.selectedChat!
    const { variations } = baseMessage

    const { voice } = settingStore

    const containerRef = useRef<HTMLDivElement>(null)

    const handleRegeneration = async () => {
      incomingMessageStore.generateVariation(chat, baseMessage)
    }

    const handleEdit = async () => {
      if (variationIndex) {
        baseMessage.setVariationIndex(variationIndex)
      }

      chatStore.selectedChat!.setMessageToEdit(baseMessage, messageVariant)
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
              className="rounded-md text-base-content/30 hover:scale-125 hover:text-base-content disabled:cursor-not-allowed"
              onClick={handleRegeneration}
              disabled={disableRegeneration}
              title={customDeleteIcon ? 'Stop' : 'Generate message variation'}
            >
              {customDeleteIcon || <Refresh />}
            </button>
          )}
        </>
      )
    }, [chat, fromBot, disableRegeneration, disableEditing])

    const WrappedContent = useMemo(() => {
      return (
        <Markdown
          remarkPlugins={[[remarkGfm, { singleTilde: false }], remarkMath]}
          rehypePlugins={[[rehypeKatex, { output: 'mathml' }]]}
          className="prose-spacing rtts-markdown prose flex w-full flex-wrap overflow-x-hidden overscroll-none prose-p:w-full -[&>*]:w-full"
          components={{
            code: DelayedCustomCodeBlock,
            math: CustomMathBlock,
          }}
        >
          {content.replace(/\n/g, '  \n')}
        </Markdown>
      )
    }, [content])

    const {
      Text: Content,
      speechStatus,
      start,
      pause,
      stop,
    } = useSpeech({
      text: WrappedContent,
      lang: voice?.language,
      voiceURI: voice?.voiceUri,
    })

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
    const hasVarations = !isVariationGroupView && !_.isEmpty(variations)

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
        {(botName || isVariationGroupView || hasVarations) && (
          <div
            className={
              'group sticky z-10 mb-2 flex flex-row gap-2 bg-base-100 align-middle opacity-100 ' +
              (isVariationGroupView ? ' top-7' : ' top-0')
            }
          >
            {hasVarations && (
              <MessageVariationSelectionRow message={baseMessage} disableEditing={disableEditing} />
            )}

            {isVariationGroupView && (
              <div
                className={'flex w-fit flex-row gap-2 ' + (fromBot ? '' : 'justify-end self-end')}
              >
                <span className="text-sm opacity-30 flex items-center">{`${variationIndex + 1}/${variations.length + 1}`}</span>

                <ToolTip
                  label={
                    baseMessage.selectedVariation === message
                      ? 'Default Variation'
                      : 'Set as default variation'
                  }
                  placement="top"
                  delay={400}
                >
                  <button
                    className={
                      'opacity-30 hover:opacity-100 ' +
                      (baseMessage.selectedVariation === message
                        ? '!text-primary !opacity-100'
                        : '')
                    }
                    onClick={() => baseMessage.setVariationIndex(variationIndex)}
                  >
                    <WindowCheck />
                  </button>
                </ToolTip>
              </div>
            )}

            {botName && <span className="opacity-30">{botName}</span>}
          </div>
        )}

        {imageUrls[0] && (
          <div className="mb-2 flex flex-row flex-wrap place-content-stretch gap-2">
            {imageUrls.map(imageUrl => (
              <button
                key={imageUrl}
                className="h-56 place-content-center overflow-hidden rounded-md border border-base-content/30 bg-base-content/30"
                onClick={() => lightboxStore.setLightboxMessageById(baseMessage.uniqId, imageUrl)}
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
              <Content />
            </div>

            {error && (
              <div
                className="group/error collapse join-item transition-all duration-300 ease-in-out"
                tabIndex={0}
              >
                <div className="collapse-title line-clamp-1 flex max-h-8 min-h-0 flex-row flex-nowrap bg-error/60 p-2 text-xs font-medium">
                  {error.message}

                  <span className="ml-2 scale-90 transition-all duration-300 ease-in-out group-focus/error:rotate-180">
                    <ChevronDown />
                  </span>
                </div>

                {error.stack && (
                  <div className="collapse-content">
                    <p className="whitespace-pre-line pt-2 text-xs break-all">{error.stack}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div
          className={
            'sticky bottom-0 z-10 flex w-full gap-2 bg-base-100 px-2 pt-2 opacity-0 group-hover:opacity-100 ' +
            (fromBot ? 'flex-row' : 'flex-row-reverse self-end')
          }
        >
          {onDestroy && (
            <button
              className="rounded-md text-error/60 hover:scale-125 hover:text-error"
              onClick={onDestroy}
              title={customDeleteIcon ? 'Stop' : 'Delete'}
            >
              {customDeleteIcon || <Delete />}
            </button>
          )}

          <CopyButton
            className="place-items-center rounded-md text-base-content/30 hover:scale-125 hover:text-base-content"
            text={content}
          />

          {extraButtons}

          {details && (
            <ToolTip
              label={<DetailsToolTip message={message} />}
              className="rounded-md"
              delay={400}
              placement="bottom-start"
            >
              <label className=" flex cursor-context-menu  items-center text-base-content/30 hover:text-base-content">
                <Warning />
              </label>
            </ToolTip>
          )}

          <div
            className={
              'flex gap-2 ' +
              (fromBot ? 'ml-auto flex-row-reverse' : 'mr-auto') +
              (_.isEmpty(content) ? ' hidden' : '')
            }
          >
            <button
              className={
                'h-fit w-fit opacity-30 hover:scale-110 hover:opacity-100 ' +
                (speechStatus === 'started' ? ' animate-pulse opacity-100' : '')
              }
              onClick={speechStatus === 'started' ? pause : start}
            >
              <PlayPause />
            </button>

            <button
              className={
                'text-error hover:scale-110' +
                (speechStatus === 'stopped'
                  ? ' pointer-events-none opacity-0'
                  : ' opacity-30  hover:opacity-100 ')
              }
              onClick={stop}
            >
              <Stop />
            </button>
          </div>
        </div>
      </div>
    )
  },
)

export default LazyMessage
