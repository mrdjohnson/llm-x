import { TooltipProps, Kbd } from '@heroui/react'
import ToolTip from '~/components/Tooltip'

const isMac = () =>
  typeof window !== 'undefined' &&
  ((navigator as any).userAgentData?.platform === 'macOS' ||
    /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent))

const cmdKey = isMac() ? 'command' : 'ctrl'

const KeyboardTooltip = ({
  command,
  shift,
  title,
  ...rest
}: Omit<TooltipProps, 'label'> & { command: string; shift?: boolean; title: string }) => (
  <ToolTip
    label={
      <span>
        {title}

        <Kbd
          keys={shift ? [cmdKey, 'shift'] : [cmdKey]}
          className="ml-2 border-none bg-transparent text-base-content shadow-none"
        >
          {command}
        </Kbd>
      </span>
    }
    {...rest}
  />
)

export default KeyboardTooltip
