import { useState } from 'react'
import { twMerge } from 'tailwind-merge'

import Copy from '~/icons/Copy'
import CopySuccess from '~/icons/CopySuccess'

type CopyButtonProps = {
  text?: string
  className?: string
  getText?: () => string | undefined
}

const CopyButton = ({ text, className = '', getText }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false)

  const handleClick = () => {
    setCopied(true)

    const content = text || getText?.() || ''

    navigator.clipboard.writeText(content)

    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button className={twMerge(className, 'swap', copied && ' swap-active')} onClick={handleClick}>
      <Copy className="swap-off" />
      <CopySuccess className="swap-on" />
    </button>
  )
}

export default CopyButton
