import type { PropsWithChildren } from 'react'
import { Tooltip as ChakraTooltip } from '@chakra-ui/react'

const ToolTip = ({ label, children }: PropsWithChildren<{ label: string }>) => {
  return (
    <ChakraTooltip
      label={label}
      className="badge badge-neutral rounded-sm p-2 font-semibold"
      placement="auto"
    >
      {children}
    </ChakraTooltip>
  )
}

export default ToolTip
