import _ from 'lodash'
import { SpeechStatus } from 'react-text-to-speech/types'
import { useMemo } from 'react'
import { HoverCard, ScrollArea } from '@mantine/core'
import { twMerge } from 'tailwind-merge'

import CopyButton from '~/components/CopyButton'

import Delete from '~/icons/Delete'
import PlayPause from '~/icons/PlayPause'
import Stop from '~/icons/Stop'
import Warning from '~/icons/Warning'
import Refresh from '~/icons/Refresh'
import Edit from '~/icons/Edit'

import { incomingMessageStore } from '~/core/IncomingMessageStore'
import { chatStore } from '~/core/chat/ChatStore'
import { MessageViewModel } from '~/core/message/MessageViewModel'

type MessageFooterProps = {
  baseMessage: MessageViewModel
  message: MessageViewModel
  disableEditing?: boolean
  variationIndex?: number
  disableRegeneration?: boolean
  customDeleteIcon?: React.ReactNode
  customDeleteText?: string
  speechStatus: SpeechStatus
  onDestroy?: () => void
  start: () => void
  pause: () => void
  stop: () => void
}

const DetailsToolTip = ({ details }: { details: string }) => {
  return (
    <div className="flex flex-col gap-1 overflow-scroll">
      <CopyButton
        className="place-self-end text-base-content/30 hover:scale-125 hover:text-base-content"
        text={details}
      />

      <ScrollArea className="w-fit max-w-[80vw]">
        <pre className="text-sm">{details}</pre>
      </ScrollArea>
    </div>
  )
}

const MessageFooter = ({
  baseMessage,
  message,
  variationIndex,
  disableEditing,
  disableRegeneration,
  customDeleteIcon,
  customDeleteText,
  speechStatus,
  onDestroy,
  start,
  pause,
  stop,
}: MessageFooterProps) => {
  const chat = chatStore.selectedChat!

  const { content, fromBot } = message.source

  const handleRegeneration = async () => {
    await incomingMessageStore.generateVariation(chat, baseMessage)
  }

  const handleEdit = async () => {
    if (variationIndex) {
      await baseMessage.setVariation(message)
    }

    await chat.setMessageToEdit(message)
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

  const details = message.source.extras?.details

  return (
    <div
      className={twMerge(
        'sticky bottom-0 z-10 flex w-full gap-2 bg-gradient-to-b from-transparent to-base-100 to-60% px-2 pt-2 opacity-0 transition-colors duration-300 ease-in-out hover:bg-base-100 group-hover:opacity-100',
        message.source.fromBot ? 'flex-row' : 'flex-row-reverse self-end',
      )}
    >
      {onDestroy && (
        <button
          className="rounded-md text-error/60 hover:scale-125 hover:text-error"
          onClick={onDestroy}
          title={customDeleteIcon ? customDeleteText || 'Stop' : 'Delete'}
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
        <HoverCard openDelay={400} closeDelay={400} position="bottom-start">
          <HoverCard.Target>
            <label className="flex cursor-context-menu items-center text-base-content/30 hover:text-base-content">
              <Warning />
            </label>
          </HoverCard.Target>

          <HoverCard.Dropdown className="rounded-md">
            <DetailsToolTip details={details} />
          </HoverCard.Dropdown>
        </HoverCard>
      )}

      <div
        className={twMerge(
          'flex gap-2',
          fromBot ? 'ml-auto flex-row-reverse' : 'mr-auto',
          _.isEmpty(content) && 'hidden',
        )}
      >
        <button
          className={twMerge(
            'h-fit w-fit opacity-30 hover:scale-110 hover:opacity-100',
            speechStatus === 'started' && 'animate-pulse opacity-100',
          )}
          onClick={speechStatus === 'started' ? pause : start}
        >
          <PlayPause />
        </button>

        <button
          className={twMerge(
            'text-error hover:scale-110',
            speechStatus === 'stopped'
              ? 'pointer-events-none opacity-0'
              : 'opacity-30 hover:opacity-100',
          )}
          onClick={stop}
        >
          <Stop />
        </button>
      </div>
    </div>
  )
}

export default MessageFooter
