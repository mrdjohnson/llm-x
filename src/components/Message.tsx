import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { PropsWithChildren, useMemo, useState } from 'react'
import { observer } from 'mobx-react-lite'

import Delete from '../icons/Delete'
import Copy from '../icons/Copy'
import CopySuccess from '../icons/CopySuccess'
import Stop from '../icons/Stop'

import { IMessageModel } from '../models/ChatModel'
import { chatStore } from '../models/ChatStore'
import { OllmaApi } from '../utils/OllamaApi'

import hljs from 'highlight.js/lib/common'

const customCodeBlock = (props: React.HTMLAttributes<HTMLElement>) => {
  const { children, className = '', ...rest } = props

  const text = children?.toString() || ''

  const multiLine = text.includes('\n')

  const copy = () => navigator.clipboard.writeText(text)

  const highlightedText = useMemo(() => {
    return hljs.highlightAuto(text).value
  }, [text])

  if (multiLine) {
    return (
      <div className="indicator w-full ">
        <button
          className="text-neutral-content/30 indicator-item hover:text-neutral-content z-10 "
          onClick={copy}
        >
          <Copy />
        </button>

        <code
          {...rest}
          dangerouslySetInnerHTML={{ __html: highlightedText }}
          className="w-full overflow-x-scroll max-w-lg xl:max-w-[700px] 2xl:max-w-[1000px]"
        />
      </div>
    )
  }

  return <code {...props}>{children}</code>
}

const Loading = () => (
  <span className="indicator-item indicator-start loading loading-dots loading-sm ml-8" />
)

// this one is observed for incoming text changes, the rest do not need to be observed
export const IncomingMessage = observer(() => {
  const incomingMessage = chatStore.selectedChat!.incomingMessage

  // checking for content also tells the observer to re-render
  if (!incomingMessage?.content) return null

  return (
    <Message
      message={incomingMessage}
      onDestroy={OllmaApi.cancelStream}
      customDeleteIcon={<Stop />}
    >
      <Loading />
    </Message>
  )
})

type MessageProps = PropsWithChildren<{
  message: IMessageModel
  loading?: boolean
  onDestroy: () => void
  customDeleteIcon?: React.ReactNode
}>

export const Message = ({ message, onDestroy, children, customDeleteIcon }: MessageProps) => {
  const { content, fromBot, uniqId, image } = message

  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      className={
        'group w-fit max-w-full flex flex-col indicator ' + (fromBot ? 'pr-6 ' : ' ml-2 self-end ')
      }
      key={uniqId}
    >
      {image && <img className="w-56 h-56 rounded-md place-self-center object-contain" src={image} />}

      <div className=" border border-base-content/20 p-2 rounded-md w-full">
        <Markdown
          remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
          className="prose inline-table w-full"
          components={{
            code: customCodeBlock,
          }}
        >
          {content}
        </Markdown>
      </div>

      {children}

      <div className={'group-hover:opacity-90 opacity-0 w-fit mt-1 ' + (!fromBot && 'self-end')}>
        <button className="mr-2 hover:text-error text-error/30 rounded-md" onClick={onDestroy}>
          {customDeleteIcon || <Delete />}
        </button>

        <button
          className="hover:text-base-content text-base-content/30 rounded-md"
          onClick={handleCopy}
        >
          <label className={'swap ' + (copied && 'swap-active')}>
            <Copy className="swap-off" />
            <CopySuccess className="swap-on" />
          </label>
        </button>
      </div>
    </div>
  )
}
