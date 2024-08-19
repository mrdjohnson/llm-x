import _ from 'lodash'

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
      className={
        'group sticky z-10 mb-2 flex flex-row gap-2 bg-base-100 align-baseline opacity-100 ' +
        (isVariationGroupView ? ' top-7' : ' top-0')
      }
    >
      {hasVariations && (
        <div>
          <MessageVariationSelectionRow message={baseMessage} disableEditing={disableEditing} />
        </div>
      )}

      {isVariationGroupView && (
        <div className={'flex w-fit flex-row gap-2 ' + (fromBot ? '' : 'justify-end self-end')}>
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
              className={
                'opacity-30 hover:opacity-100 ' +
                (baseMessage.selectedVariation === message ? '!text-primary !opacity-100' : '')
              }
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
