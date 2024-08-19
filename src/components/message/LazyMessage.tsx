import React, { Suspense, useCallback, useEffect, useMemo, useRef } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { type PropsWithChildren } from 'react'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { useSpeech } from 'react-text-to-speech'

import ChevronDown from '~/icons/ChevronDown'

import { lightboxStore } from '~/features/lightbox/LightboxStore'

import { MessageProps } from '~/components/message/Message'
import MessageHeader from '~/components/message/MessageHeader'
import MessageFooter from '~/components/message/MessageFooter'

import CachedImage from '~/components/CachedImage'
import CustomMathBlock from '~/components/message/CustomMathBlock'
import { voiceStore } from '~/core/voice/VoiceStore'

const CustomCodeBlock = React.lazy(() => import('~/components/message/CustomCodeBlock'))

const DelayedCustomCodeBlock = (props: PropsWithChildren) => {
  return (
    <Suspense fallback={<code {...props} className="not-prose bg-transparent" />}>
      <CustomCodeBlock {...props} />
    </Suspense>
  )
}

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
    const message = messageVariant || baseMessage

    const { fromBot, id, extras, imageUrls } = message.source
    const content = message.content
    const error = extras?.error

    const voice = voiceStore.selectedVoice

    const containerRef = useRef<HTMLDivElement>(null)

    const WrappedContent = useMemo(() => {
      return (
        <Markdown
          remarkPlugins={[[remarkGfm, { singleTilde: false }], remarkMath]}
          rehypePlugins={[[rehypeKatex, { output: 'mathml' }]]}
          className="prose-spacing rtts-markdown -[&>*]:w-full prose flex w-full flex-wrap overflow-x-hidden overscroll-none prose-p:w-full"
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

    return (
      <div
        className={
          'group indicator relative flex w-fit min-w-6 max-w-full scroll-m-5 flex-col ' +
          (fromBot ? 'pr-4 lg:pr-8' : ' self-end pl-4 lg:pl-8 ') +
          (shouldDimMessage ? ' opacity-55 ' : '') +
          (children ? ' mt-2 ' : '')
        }
        key={id}
        ref={containerRef}
      >
        <MessageHeader
          baseMessage={baseMessage}
          message={message}
          disableEditing={disableEditing}
          variationIndex={variationIndex}
        />

        {imageUrls[0] && (
          <div className="mb-2 flex flex-row flex-wrap place-content-stretch gap-2">
            {imageUrls.map(imageUrl => (
              <button
                key={imageUrl}
                className="h-56 place-content-center overflow-hidden rounded-md border border-base-content/30 bg-base-content/30"
                onClick={() => lightboxStore.setLightboxMessageById(baseMessage.id, imageUrl)}
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
                    <p className="whitespace-pre-line break-all pt-2 text-xs">{error.stack}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <MessageFooter
          baseMessage={baseMessage}
          message={message}
          variationIndex={variationIndex}
          disableEditing={disableEditing}
          disableRegeneration={disableRegeneration}
          customDeleteIcon={customDeleteIcon}
          speechStatus={speechStatus}
          onDestroy={onDestroy}
          start={start}
          pause={pause}
          stop={stop}
        />
      </div>
    )
  },
)

export default LazyMessage
