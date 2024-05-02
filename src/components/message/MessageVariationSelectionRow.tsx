import { observer } from 'mobx-react-lite'

import ChevronDown from '~/icons/ChevronDown'
import Delete from '~/icons/Delete'
import WindowView from '~/icons/WindowView'

import { IMessageModel } from '~/models/MessageModel'
import ToolTip from '~/components/Tooltip'

const MessageVariationSelectionRow = observer(
  ({ message, disableEditing }: { message: IMessageModel; disableEditing?: boolean }) => {
    const { selectedVariationIndex = 0, variations } = message

    return (
      <div className="flex flex-row items-center">
        <ToolTip label="See all variations" placement="top">
          <button
            className="text-sm opacity-30 hover:scale-105 hover:opacity-100"
            onClick={() => message.setShowVariations(true)}
          >
            <WindowView />
          </button>
        </ToolTip>

        <button
          className="ml-2 opacity-30 hover:cursor-pointer hover:opacity-100 disabled:cursor-default disabled:opacity-0"
          disabled={!message.hasPreviousVariation || disableEditing}
          onClick={message.selectPreviousVariation}
        >
          <ChevronDown className="!h-3 !w-3 rotate-90" />
        </button>

        <span className="text-sm opacity-30">
          {selectedVariationIndex + 1} / {variations.length + 1}
        </span>

        <button
          className="mr-2 opacity-30 hover:cursor-pointer hover:opacity-100 disabled:cursor-default disabled:opacity-0"
          disabled={!message.hasNextVariation || disableEditing}
          onClick={message.selectNextVariation}
        >
          <ChevronDown className="!h-3 !w-3 -rotate-90" />
        </button>

        {message.hasPreviousVariation && !disableEditing && (
          <ToolTip label="Delete variation" placement="top">
            <button
              className="rounded-md text-error/30 opacity-0 hover:scale-125 hover:text-error group-hover:opacity-100"
              onClick={() => message.removeVariation(message.selectedVariation)}
            >
              <Delete />
            </button>
          </ToolTip>
        )}
      </div>
    )
  },
)

export default MessageVariationSelectionRow
