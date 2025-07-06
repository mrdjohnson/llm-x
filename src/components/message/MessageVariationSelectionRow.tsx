import ChevronDown from '~/icons/ChevronDown'
import Delete from '~/icons/Delete'
import WindowView from '~/icons/WindowView'

import ToolTip from '~/components/Tooltip'
import { MessageViewModel } from '~/core/message/MessageViewModel'

type MessageVariationSelectionRowProps = {
  message: MessageViewModel
  disableEditing?: boolean
}

const MessageVariationSelectionRow = ({
  message,
  disableEditing,
}: MessageVariationSelectionRowProps) => {
  const selectedVariationHandler = message.selectedVariationHandler

  return (
    <div className="flex flex-row items-center">
      <ToolTip label="See all variations" placement="top">
        <button
          className="opacity-30 hover:scale-105 hover:opacity-100"
          onClick={() => message.setShowVariations(true)}
        >
          <WindowView />
        </button>
      </ToolTip>

      <button
        className="ml-2 opacity-30 hover:cursor-pointer hover:opacity-100 disabled:cursor-default disabled:opacity-0"
        disabled={!selectedVariationHandler.hasPreviousVariation || disableEditing}
        onClick={() => message.selectPreviousVariation()}
      >
        <ChevronDown className="!h-3 !w-3 rotate-90" />
      </button>

      <span className="whitespace-nowrap opacity-30">
        {selectedVariationHandler.selectedVariationIndex + 1} / {message.variations.length + 1}
      </span>

      <button
        className="mr-2 opacity-30 hover:cursor-pointer hover:opacity-100 disabled:cursor-default disabled:opacity-0"
        disabled={!selectedVariationHandler.hasNextVariation || disableEditing}
        onClick={() => message.selectNextVariation()}
      >
        <ChevronDown className="!h-3 !w-3 -rotate-90" />
      </button>

      {selectedVariationHandler.hasPreviousVariation && !disableEditing && (
        <ToolTip label="Delete variation" placement="top">
          <button
            className="rounded-md text-error/60 opacity-0 hover:scale-125 hover:text-error group-hover:opacity-100"
            onClick={() => message.removeVariation(message.selectedVariation)}
          >
            <Delete />
          </button>
        </ToolTip>
      )}
    </div>
  )
}

export default MessageVariationSelectionRow
