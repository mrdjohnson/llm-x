import { useState } from 'react'
import { Button, ButtonProps } from '@mantine/core'
import { twMerge } from 'tailwind-merge'

import Copy from '~/icons/Copy'
import CopySuccess from '~/icons/CopySuccess'

type CopyButtonProps = ButtonProps & {
  text?: string
  className?: string
  getText?: () => string | undefined
}

const CopyButton = ({ text, className = '', getText, ...props }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false)

  const handleClick = () => {
    setCopied(true)

    const content = text || getText?.() || ''

    navigator.clipboard.writeText(content)

    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Button className={className} onClick={handleClick} {...props}>
      <span className={twMerge('swap', copied && 'swap-active')}>
        <Copy className="swap-off" />
        <CopySuccess className="swap-on" />
      </span>
    </Button>
  )
}

export default CopyButton
