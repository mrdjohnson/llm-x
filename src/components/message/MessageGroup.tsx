import { PropsWithChildren } from 'react'
import { observer } from 'mobx-react-lite'

import WindowClose from '~/icons/WindowClose'
import WindowPlus from '~/icons/WindowPlus'
import Delete from '~/icons/Delete'

import { IMessageModel } from '~/models/MessageModel'
import ToolTip from '~/components/Tooltip'

type MessageGroupType = PropsWithChildren<{
  message: IMessageModel
  onAddMoreVariations: () => void
}>

const MessageGroup = observer(({ message, children, onAddMoreVariations }: MessageGroupType) => {
  return (
    <div className="relative flex w-fit flex-col" key={message.uniqId}>
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
            className={'bg-base-100 text-error/30 hover:scale-125 hover:text-error'}
            onClick={message.selfDestruct}
          >
            <Delete />
          </button>
        </ToolTip>

        <span className="sticky top-0 text-sm font-semibold text-base-content/30">
          {message.variations.length + 1} Variations
        </span>

        <ToolTip label="Add 3 more variations" placement="top" delay={400}>
          <button
            className="text-sm opacity-30 hover:scale-105 hover:opacity-100 ml-auto"
            onClick={onAddMoreVariations}
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
})

export default MessageGroup
