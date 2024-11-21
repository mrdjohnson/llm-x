import type { PropsWithChildren, ReactNode } from 'react'
import { Tooltip as NextUiTooltip, TooltipProps as NextUiTooltipProps } from '@nextui-org/react'
import { twMerge } from 'tailwind-merge'

type ToolTipProps = PropsWithChildren<{
  label: ReactNode
  className?: string
  placement?: NextUiTooltipProps['placement']
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
}: ToolTipProps) => {
  return (
    <NextUiTooltip
      content={label}
      className={twMerge(
        '-translate-y-[0.5px] rounded-full border border-base-content/10 bg-base-200 p-2 font-semibold text-base-content/80 shadow-none',
        className,
      )}
      classNames={{
        base: 'before:bg-base-200 before:shadow-none before:border before:border-base-content/10 before:z-10  before:border-t-0 before:border-l-0 ',
      }}
      placement={placement}
      delay={delay}
      showArrow={showArrow}
    >
      {children}
    </NextUiTooltip>
  )
}

export default ToolTip
