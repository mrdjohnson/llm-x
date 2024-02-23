import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { PropsWithChildren, useMemo, useState } from 'react'
import { observer } from 'mobx-react-lite'

import Delete from '../icons/Delete'
import Copy from '../icons/Copy'
import CopySuccess from '../icons/CopySuccess'
import Stop from '../icons/Stop'
import Refresh from '../icons/Refresh'

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
          className="indicator-item z-10 text-neutral-content/30 hover:text-neutral-content "
          onClick={copy}
        >
          <Copy />
        </button>

        <code
          {...rest}
          dangerouslySetInnerHTML={{ __html: highlightedText }}
          className="w-full max-w-lg overflow-x-scroll xl:max-w-[700px] 2xl:max-w-[1000px]"
        />
      </div>
    )
  }

  return <code {...props}>{children}</code>
}

const Loading = () => (
  <span className="indicator-item loading loading-dots loading-sm indicator-start ml-8" />
)

// this one is observed for incoming text changes, the rest do not need to be observed
export const IncomingMessage = observer(() => {
  const incomingMessage = chatStore.selectedChat!.incomingMessage

  // show an empty loading box when we are getting a message from the server
  // checking for content also tells the observer to re-render
  if (incomingMessage?.content === undefined) return null

  return (
    <Message
      message={incomingMessage}
      onDestroy={OllmaApi.cancelStream}
      customDeleteIcon={<Stop />}
      disableRegeneration
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
  disableRegeneration?: boolean
}>

export const Message = ({
  message,
  onDestroy,
  children,
  customDeleteIcon,
  disableRegeneration,
}: MessageProps) => {
  const { content, fromBot, uniqId, image } = message

  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleRegeneration = async () => {
    chatStore.selectedChat!.generateMessage(message)
  }

  return (
    <div
      className={
        'group indicator flex w-fit max-w-full flex-col min-w-6 ' + (fromBot ? 'pr-6 ' : ' ml-2 self-end ')
      }
      key={uniqId}
    >
      {image && (
        <img className="h-56 w-56 place-self-center rounded-md object-contain" src={image} />
      )}

      <div className=" w-full rounded-md border border-base-content/20 p-2">
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

      <div
        className={
          'mt-1 flex w-fit flex-row gap-2 opacity-0 group-hover:opacity-90 ' +
          (!fromBot && 'self-end')
        }
      >
        <button className="rounded-md text-error/30 hover:text-error" onClick={onDestroy}>
          {customDeleteIcon || <Delete />}
        </button>

        <button
          className="rounded-md text-base-content/30 hover:text-base-content"
          onClick={handleCopy}
        >
          <label className={'swap ' + (copied && 'swap-active')}>
            <Copy className="swap-off" />
            <CopySuccess className="swap-on" />
          </label>
        </button>

        {!children && fromBot && (
          <button
            className="rounded-md text-base-content/30 hover:text-base-content"
            onClick={handleRegeneration}
            disabled={disableRegeneration}
          >
            {customDeleteIcon || <Refresh />}
          </button>
        )}
      </div>
    </div>
  )
}
