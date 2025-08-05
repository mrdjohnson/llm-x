import type { PropsWithChildren, ReactNode } from 'react'

import { Tooltip as MantineTooltip, type TooltipProps as MantineTooltipProps } from '@mantine/core'

export type ToolTipProps = MantineTooltipProps &
  PropsWithChildren<{
    label: ReactNode
    className?: string
    placement?: MantineTooltipProps['position']
    delay?: number
    showArrow?: boolean
  }>

const ToolTip = ({
  label,
  placement,
  children,
  className = '',
  delay,
  showArrow = true,
  ...props
}: ToolTipProps) => {
  return (
    <MantineTooltip
      label={label}
      className={className}
      position={placement}
      openDelay={delay}
      closeDelay={delay}
      withArrow={showArrow}
      {...props}
    >
      {children}
    </MantineTooltip>
  )
}

export default ToolTip
