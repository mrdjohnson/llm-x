import { useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import _ from 'lodash'
import { useNavigate } from 'react-router-dom'
import { Input } from '@nextui-org/react'
import useMedia from 'use-media'

import ChevronDown from '~/icons/ChevronDown'
import { connectionStore } from '~/core/connection/ConnectionStore'
import { twMerge } from 'tailwind-merge'

const ModelSelector = observer(() => {
  const navigate = useNavigate()

  const isMobile = useMedia('(max-width: 768px)')

  const { selectedModelLabel, isAnyServerConnected, selectedConnection } = connectionStore
  const noServer = !isAnyServerConnected

  const label = useMemo(() => {
    if (noServer) {
      return 'No Servers connected'
    }

    if (selectedModelLabel && selectedConnection) {
      return isMobile ? undefined : selectedConnection.label
    }

    if (!selectedConnection) return 'Add a Server here'

    if (_.isEmpty(selectedConnection.models)) {
      return `No ${selectedConnection.label} models available`
    }

    return `No ${selectedConnection.label} models selected`
  }, [noServer, selectedConnection?.models, selectedModelLabel, isMobile])

  const handleClick = () => {
    if (!selectedConnection) {
      navigate('/models')
    } else {
      navigate('/models/' + selectedConnection.id)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="w-full !cursor-pointer rounded-md border-2 border-base-content/20 hover:!border-base-content/30 hover:bg-base-100"
    >
      <Input
        isReadOnly
        label={label}
        variant="bordered"
        value={selectedModelLabel}
        size={isMobile ? 'sm' : undefined}
        className="pointer-events-none w-full !cursor-pointer bg-transparent"
        classNames={{
          inputWrapper: twMerge(
            'btn !cursor-pointer border-none p-2 pr-1 !min-h-0',
            isMobile && 'h-fit',
          ),
          input: '!cursor-pointer',
          label: '!cursor-pointer mr-2',
          innerWrapper: twMerge('!cursor-pointer', isMobile && 'h-fit'),
        }}
        endContent={
          <ChevronDown className="-rotate-90 place-self-center !stroke-[3px]  text-base-content/45" />
        }
      />
    </button>
  )
})

export default ModelSelector
