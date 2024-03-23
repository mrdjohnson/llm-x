import React, { Suspense } from 'react'
import type { PropsWithChildren } from 'react'
import { observer } from 'mobx-react-lite'

import Stop from '../icons/Stop'

import { IMessageModel } from '../models/MessageModel'
import { chatStore } from '../models/ChatStore'

const LazyMessage = React.lazy(() => import('./LazyMessage'))

const Loading = () => (
  <span className="indicator-item loading loading-dots loading-sm indicator-start ml-4 opacity-65" />
)

// this one is observed for incoming text changes, the rest do not need to be observed
export const IncomingMessage = observer(() => {
  const chat = chatStore.selectedChat!
  const incomingMessage = chat.incomingMessage

  // show an empty loading box when we are getting a message from the server
  // checking for content also tells the observer to re-render
  if (incomingMessage?.content === undefined) return null

  return (
    <Message
      message={incomingMessage}
      onDestroy={chat.abortGeneration}
      customDeleteIcon={<Stop />}
      disableRegeneration
      shouldScrollIntoView
    >
      <Loading />
    </Message>
  )
})

export const MessageToEdit = observer(({ message }: { message: IMessageModel }) => {
  const chat = chatStore.selectedChat!

  return (
    <Message
      message={message}
      onDestroy={() => chat.setMessageToEdit(undefined)}
      customDeleteIcon={<Stop />}
      shouldDimMessage={false}
      shouldScrollIntoView
    >
      <Loading />
    </Message>
  )
})

export type MessageProps = PropsWithChildren<{
  message: IMessageModel
  loading?: boolean
  onDestroy: () => void
  customDeleteIcon?: React.ReactNode
  disableRegeneration?: boolean
  disableEditing?: boolean
  shouldDimMessage?: boolean
  shouldScrollIntoView?: boolean
}>

export const Message = (props: MessageProps) => {
  return (
    <Suspense fallback={null}>
      <LazyMessage {...props} />
    </Suspense>
  )
}
