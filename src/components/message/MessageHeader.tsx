import _ from 'lodash'
import { twMerge } from 'tailwind-merge'

import WindowCheck from '~/icons/WindowCheck'
import { MessageViewModel } from '~/core/message/MessageViewModel'

import ToolTip from '~/components/Tooltip'
import MessageVariationSelectionRow from '~/components/message/MessageVariationSelectionRow'

type MessageHeaderProps = {
  baseMessage: MessageViewModel
  message: MessageViewModel
  disableEditing?: boolean
  variationIndex?: number
}

const MessageHeader = ({
  baseMessage,
  message,
  disableEditing,
  variationIndex,
}: MessageHeaderProps) => {
  const { fromBot, botName } = message.source
  const variations = message.rootMessage.variations
  const isVariationGroupView = variationIndex !== undefined

  const hasVariations = !isVariationGroupView && !_.isEmpty(variations)

  if (!botName && !isVariationGroupView && !hasVariations) return null

  return (
    <div
      className={twMerge(
        'group sticky top-0 z-10 mb-2 flex flex-row gap-2 bg-gradient-to-b from-base-100 from-60% to-transparent pb-2 align-baseline transition-colors duration-300 ease-in-out hover:bg-base-100',
        isVariationGroupView && ' top-7',
      )}
    >
      {hasVariations && (
        <div>
          <MessageVariationSelectionRow message={baseMessage} disableEditing={disableEditing} />
        </div>
      )}

      {isVariationGroupView && (
        <div className={twMerge('flex w-fit flex-row gap-2', !fromBot && 'justify-end self-end')}>
          <span className="text-sm opacity-30">{`${variationIndex + 1}/${variations.length + 1}`}</span>

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
              className={twMerge(
                'opacity-30 hover:opacity-100',
                baseMessage.selectedVariation === message && '!text-primary !opacity-100',
              )}
              onClick={() => baseMessage.setVariation(message)}
            >
              <WindowCheck />
            </button>
          </ToolTip>
        </div>
      )}

      {botName && <span className="opacity-30">{botName}</span>}
    </div>
  )
}

export default MessageHeader
