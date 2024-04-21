import type { PropsWithChildren, ReactNode } from 'react'
import { Tooltip as NextUiTooltip, TooltipProps as NextUiTooltipProps } from '@nextui-org/react'

type ToolTipProps = PropsWithChildren<{
  label: ReactNode
  className?: string
  placement?: NextUiTooltipProps['placement']
}>

const ToolTip = ({ label, placement, children, className = '' }: ToolTipProps) => {
  return (
    <NextUiTooltip
      content={label}
      className={'rounded-full bg-neutral p-2 font-semibold shadow-none ' + className}
      classNames={{
        base: 'before:bg-neutral before:mt-1 before:shadow-none',
      }}
      placement={placement}
      showArrow
    >
      {children}
    </NextUiTooltip>
  )
}

export default ToolTip
