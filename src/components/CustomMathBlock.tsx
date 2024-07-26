import { useRef } from 'react'

import CopyButton from '~/components/CopyButton'

import 'highlight.js/styles/base16/woodland.min.css'

const CustomMathBlock = (props: React.HTMLAttributes<HTMLElement>) => {
  const ref = useRef<HTMLDivElement>(null)

  const getText = () => {
    const text = ref.current?.getElementsByTagName('annotation')?.[0]

    return text?.textContent?.trim() || ''
  }

  return (
    <pre className='m-0'>
      <div className="indicator block w-fit pr-2 pt-4">
        <CopyButton
          className="indicator-item !absolute z-10 text-neutral-content/30 hover:text-neutral-content"
          getText={getText}
        />

        <div ref={ref}>
          <math
            {...props}
            className="not-prose w-full overflow-x-scroll text-sm [&>*]:!text-sm"
            ref={ref}
          />
        </div>
      </div>
    </pre>
  )
}

export default CustomMathBlock
