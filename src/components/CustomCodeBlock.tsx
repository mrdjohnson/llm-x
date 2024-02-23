import { useMemo } from 'react'

import Copy from '../icons/Copy'

import hljs from 'highlight.js/lib/common'

const CustomCodeBlock = (props: React.HTMLAttributes<HTMLElement>) => {
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

export default CustomCodeBlock
