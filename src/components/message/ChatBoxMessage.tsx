import _ from 'lodash'

import { IncomingMessage, Message, MessageProps, MessageToEdit } from '~/components/message/Message'
import MessageGroup from '~/components/message/MessageGroup'

import { incomingMessageStore } from '~/core/IncomingMessageStore'
import { chatStore } from '~/core/chat/ChatStore'

const MessageOrEditedMessage = ({
  message,
  messageVariant,
  variationIndex,
  variationIdToEdit,
  ...props
}: MessageProps) => {
  if (incomingMessageStore.contains(messageVariant)) {
    return (
      <IncomingMessage key={messageVariant.id} message={message} messageVariant={messageVariant} />
    )
  }

  if (variationIdToEdit === messageVariant.id) {
    return <MessageToEdit key="message-to-edit" message={message} messageVariant={messageVariant} />
  }

  const handleDestroy = () => {
    if (_.isNil(variationIndex)) {
      // single view, any message
      chatStore.selectedChat!.destroyMessage(message)
    } else if (_.gt(variationIndex, 0)) {
      // group view, not the original message
      message.removeVariation(messageVariant)
    }
  }

  return (
    <Message
      key={messageVariant.id}
      message={message}
      messageVariant={messageVariant}
      variationIndex={variationIndex}
      onDestroy={handleDestroy}
      {...props}
    />
  )
}

// figures out which kind of message to display
export const ChatBoxMessage = ({ message, ...props }: Omit<MessageProps, 'messageVariant'>) => {
  const chat = chatStore.selectedChat!

  if (!message.showVariations) {
    return (
      <MessageOrEditedMessage
        key={message.selectedVariation.id}
        message={message}
        {...props}
        messageVariant={message.selectedVariation}
      />
    )
  }

  return (
    <MessageGroup
      message={message}
      key={message.id + '_group'}
      chat={chat}
      shouldScrollIntoView={incomingMessageStore.containsGroup(message)}
    >
      {message.selectedVariationHandler.displayVariations.map((variant, index) => (
        <MessageOrEditedMessage
          key={variant.id}
          message={message}
          {...props}
          messageVariant={variant}
          variationIndex={index}
        />
      ))}
    </MessageGroup>
  )
}
