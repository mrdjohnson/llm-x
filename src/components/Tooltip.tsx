import type { PropsWithChildren, ReactNode } from 'react'
import { Tooltip as NextUiTooltip, TooltipProps as NextUiTooltipProps } from '@nextui-org/react'

type ToolTipProps = PropsWithChildren<{
  label: ReactNode
  className?: string
  placement?: NextUiTooltipProps['placement']
  delay?: number
}>

const ToolTip = ({ label, placement, children, className = '', delay }: ToolTipProps) => {
  return (
    <NextUiTooltip
      content={label}
      className={
        'rounded-full bg-base-200 p-2 font-semibold text-base-content/80 shadow-none ' + className
      }
      classNames={{
        base: 'before:bg-base-200 before:mt-1 before:shadow-none',
      }}
      placement={placement}
      delay={delay}
      showArrow
    >
      {children}
    </NextUiTooltip>
  )
}

export default ToolTip
