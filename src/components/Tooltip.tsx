import type { PropsWithChildren } from 'react'
import { Tooltip as NextUiTooltip, TooltipProps as NextUiTooltipProps } from '@nextui-org/react'

type ToolTipProps = PropsWithChildren<{
  label: string
  className?: string
  placement?: NextUiTooltipProps['placement']
}>

const ToolTip = ({ label, placement, children, className = '' }: ToolTipProps) => {
  return (
    <NextUiTooltip
      content={label}
      className={'badge !badge-neutral rounded-full p-2 font-semibold shadow-none  ' + className}
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
