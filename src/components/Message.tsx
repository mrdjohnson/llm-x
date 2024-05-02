import React, { Suspense } from 'react'
import type { PropsWithChildren } from 'react'
import { observer } from 'mobx-react-lite'

import Stop from '~/icons/Stop'

import { IMessageModel } from '~/models/MessageModel'
import { chatStore } from '~/models/ChatStore'
import { incomingMessageStore } from '~/models/IncomingMessageStore'

const LazyMessage = React.lazy(() => import('~/components/LazyMessage'))

const Loading = () => (
  <span className="indicator-item loading loading-dots loading-sm indicator-start ml-4 opacity-65" />
)

type CustomMessageProps = {
  message: IMessageModel
  messageVariant: IMessageModel
}

export const IncomingMessage = observer(({ message, messageVariant }: CustomMessageProps) => {
  // show an empty loading box when we are getting a message from the server
  // checking for content also tells the observer to re-render
  if (message?.content === undefined) return null

  return (
    <Message
      message={message}
      messageVariant={messageVariant}
      onDestroy={() => incomingMessageStore.abortGeneration(messageVariant)}
      customDeleteIcon={<Stop />}
      disableRegeneration
      disableEditing
      shouldScrollIntoView
    >
      <Loading />
    </Message>
  )
})

export const MessageToEdit = observer(({ message, messageVariant }: CustomMessageProps) => {
  const chat = chatStore.selectedChat!

  return (
    <Message
      message={message}
      messageVariant={messageVariant}
      onDestroy={() => chat.setMessageToEdit(undefined)}
      customDeleteIcon={<Stop />}
      shouldDimMessage={false}
      shouldScrollIntoView
      disableEditing
    >
      <Loading />
    </Message>
  )
})

export type MessageProps = PropsWithChildren<{
  message: IMessageModel
  messageVariant?: IMessageModel
  loading?: boolean
  onDestroy?: () => void
  customDeleteIcon?: React.ReactNode
  disableRegeneration?: boolean
  disableEditing?: boolean
  shouldDimMessage?: boolean
  shouldScrollIntoView?: boolean
  variationIndex?: number
}>

export const Message = (props: MessageProps) => {
  return (
    <Suspense fallback={null}>
      <LazyMessage {...props} />
    </Suspense>
  )
}
