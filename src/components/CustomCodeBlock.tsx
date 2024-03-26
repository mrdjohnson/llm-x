import { useMemo } from 'react'
import hljs from 'highlight.js/lib/common'

import CopyButton from '~/components/CopyButton'

import 'highlight.js/styles/base16/woodland.min.css'

const CustomCodeBlock = (props: React.HTMLAttributes<HTMLElement>) => {
  const { children, className, ...rest } = props

  const text = children?.toString() || ''

  const multiLine = text.includes('\n')

  const languageOverride = useMemo(() => {
    return className?.replace('language-', '')
  }, [className, multiLine])

  const { highlightedText, language } = useMemo(() => {
    if (languageOverride) {
      const hightligted = hljs.highlight(languageOverride, text)

      return {
        highlightedText: hightligted.value,
        language: languageOverride,
      }
    }

    const hightligted = hljs.highlightAuto(text)

    return {
      highlightedText: hightligted.value,
      language: hightligted.language,
    }
  }, [text])

  if (multiLine) {
    return (
      <div className="indicator inline-grid w-full pr-2 pt-4">
        <CopyButton
          className="indicator-item !absolute z-10 text-neutral-content/30 hover:text-neutral-content"
          text={text}
        />

        <div className="absolute -left-2 -top-2 text-sm opacity-30">{language}</div>

        <code
          {...rest}
          dangerouslySetInnerHTML={{ __html: highlightedText }}
          className="not-prose w-full overflow-x-scroll text-sm [&>*]:!text-sm"
        />
      </div>
    )
  }

  return <code {...props}>{children}</code>
}

export default CustomCodeBlock
