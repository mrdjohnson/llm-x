import { TooltipProps, Kbd } from '@heroui/react'

import ToolTip from '~/components/Tooltip'
import { humanizeShortcut } from '~/utils/humanizeShortcut'

const KeyboardTooltip = ({
  command,
  title,
  ...rest
}: Omit<TooltipProps, 'label'> & { command: string; title: string }) => (
  <ToolTip
    label={
      <span>
        {title}

        <Kbd className="ml-2 border-none bg-transparent text-base-content shadow-none">
          {humanizeShortcut(command)}
        </Kbd>
      </span>
    }
    {...rest}
  />
)

export default KeyboardTooltip
