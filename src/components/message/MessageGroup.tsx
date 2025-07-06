import _ from 'lodash'
import { useCallback, useEffect, useRef, type PropsWithChildren } from 'react'

import WindowClose from '~/icons/WindowClose'
import WindowPlus from '~/icons/WindowPlus'
import Delete from '~/icons/Delete'

import ToolTip from '~/components/Tooltip'

import { MessageViewModel } from '~/core/message/MessageViewModel'
import { ChatViewModel } from '~/core/chat/ChatViewModel'
import { incomingMessageStore } from '~/core/IncomingMessageStore'

type MessageGroupType = PropsWithChildren<{
  message: MessageViewModel
  chat: ChatViewModel
  shouldScrollIntoView?: boolean
}>

const MessageGroup = ({ message, children, chat, shouldScrollIntoView }: MessageGroupType) => {
  const containerRef = useRef<HTMLDivElement>(null)

  const handleAddMoreVariations = async () => {
    for (let index = 0; index < 3; index++) {
      await incomingMessageStore.generateVariation(chat, message)
    }
  }

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
  useEffect(() => {
    if (shouldScrollIntoView) {
      scrollIntoView()
    }
  }, [shouldScrollIntoView])

  return (
    <div className="relative flex w-fit flex-col" key={message.id} ref={containerRef}>
      <div className="sticky top-0 z-20 mr-4 flex w-full flex-row gap-2 bg-base-100 pb-2">
        <ToolTip label="Close variations group" placement="top" delay={400}>
          <button
            className="text-sm opacity-30 hover:scale-105 hover:opacity-100"
            onClick={() => message.setShowVariations(false)}
          >
            <WindowClose />
          </button>
        </ToolTip>

        <ToolTip label="Delete variation group" placement="top" delay={400}>
          <button
            className="bg-base-100 text-error/30 hover:scale-125 hover:text-error"
            onClick={() => chat.destroyMessage(message)}
          >
            <Delete />
          </button>
        </ToolTip>

        <span className="sticky top-0 text-sm font-semibold text-base-content/30">
          {message.variations.length + 1} Variations
        </span>

        <ToolTip label="Add 3 more variations" placement="top" delay={400}>
          <button
            className="ml-auto text-sm opacity-30 hover:scale-105 hover:opacity-100"
            onClick={handleAddMoreVariations}
          >
            <WindowPlus />
          </button>
        </ToolTip>
      </div>

      <div className="flex flex-col flex-wrap gap-4 rounded-md border border-base-content/10 p-2 pt-4">
        {children}
      </div>
    </div>
  )
}

export default MessageGroup
