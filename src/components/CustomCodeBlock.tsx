import { useMemo } from 'react'

import Copy from '../icons/Copy'

import hljs from 'highlight.js/lib/common'

import 'highlight.js/styles/base16/woodland.min.css'

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
      <div className="indicator inline-grid w-full pr-2 ">
        <button
          className="indicator-item z-10 text-neutral-content/30 hover:text-neutral-content "
          onClick={copy}
        >
          <Copy />
        </button>

        <code
          {...rest}
          dangerouslySetInnerHTML={{ __html: highlightedText }}
          className="w-full overflow-x-scroll "
        />
      </div>
    )
  }

  return <code {...props}>{children}</code>
}

export default CustomCodeBlock
