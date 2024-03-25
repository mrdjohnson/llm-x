import { useState } from 'react'

import Copy from '~/icons/Copy'
import CopySuccess from '~/icons/CopySuccess'

const CopyButton = ({ text, className = '' }: { text: string; className?: string }) => {
  const [copied, setCopied] = useState(false)

  const handleClick = () => {
    setCopied(true)

    navigator.clipboard.writeText(text)

    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button className={className + ' swap ' + (copied && ' swap-active')} onClick={handleClick}>
      <Copy className="swap-off" />
      <CopySuccess className="swap-on" />
    </button>
  )
}

export default CopyButton
