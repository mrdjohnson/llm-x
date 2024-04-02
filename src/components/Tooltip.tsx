import type { PropsWithChildren } from 'react'
import { Tooltip as ChakraTooltip, type PlacementWithLogical } from '@chakra-ui/react'

const ToolTip = ({
  label,
  placement = 'auto',
  children,
}: PropsWithChildren<{ label: string; placement?: PlacementWithLogical }>) => {
  return (
    <ChakraTooltip
      label={label}
      className="badge badge-neutral rounded-sm p-2 font-semibold"
      placement={placement}
    >
      {children}
    </ChakraTooltip>
  )
}

export default ToolTip
