import { Badge } from '@mantine/core'

import ToolTip, { type ToolTipProps } from '~/components/Tooltip'
import { humanizeShortcut } from '~/utils/humanizeShortcut'

const KeyboardTooltip = ({
  command,
  title,
  ...rest
}: Omit<ToolTipProps, 'label'> & { command: string; title: string }) => (
  <ToolTip
    label={
      <span className="font-semibold">
        {title}

        <Badge variant="outline" className="p-2! ml-2">
          {humanizeShortcut(command)}
        </Badge>
      </span>
    }
    {...rest}
  />
)

export default KeyboardTooltip
