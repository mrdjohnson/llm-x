import { TooltipProps } from '@heroui/react'

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

        <span className="badge ml-2 border border-base-content/80 bg-transparent py-2 font-normal text-base-content/80">
          {humanizeShortcut(command)}
        </span>
      </span>
    }
    {...rest}
  />
)

export default KeyboardTooltip
