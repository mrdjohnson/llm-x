import { TooltipProps, Kbd } from '@nextui-org/react'

import ToolTip from '~/components/Tooltip'

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
          keys={shift ? ['command', 'shift'] : ['command']}
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
