import { useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import _ from 'lodash'
import { useNavigate } from 'react-router-dom'
import { Input } from "@heroui/react"
import useMedia from 'use-media'
import { twMerge } from 'tailwind-merge'

import ChevronDown from '~/icons/ChevronDown'

import { connectionStore } from '~/core/connection/ConnectionStore'
import { chatStore } from '~/core/chat/ChatStore'

const ModelSelector = observer(() => {
  const navigate = useNavigate()

  const isMobile = useMedia('(max-width: 768px)')

  const { selectedModelLabel, isAnyServerConnected, selectedConnection } = connectionStore
  const noServer = !isAnyServerConnected

  const selectedChat = chatStore.selectedChat
  const actors = selectedChat?.actors || []
  const hasActorOverrides = !_.isEmpty(actors)

  const label = useMemo(() => {
    if (noServer) {
      return 'No Servers connected'
    }

    if (isMobile) {
      return undefined
    }

    if (hasActorOverrides) {
      return actors.length + ' model' + (actors.length === 1 ? '' : 's')
    }

    if (selectedModelLabel && selectedConnection) {
      return selectedConnection.label
    }

    if (!selectedConnection) return 'Add a Server here'

    if (_.isEmpty(selectedConnection.models)) {
      return `No ${selectedConnection.label} models available`
    }

    return `No ${selectedConnection.label} models selected`
  }, [
    noServer,
    selectedConnection?.models,
    selectedModelLabel,
    isMobile,
    hasActorOverrides,
    actors.length,
  ])

  const modelValue = useMemo(() => {
    if (actors[0]) {
      const value = actors[0]?.modelLabel

      if (actors.length > 1) {
        return `${value} (+${actors.length - 1})`
      }

      return value + ' (chat)'
    }

    return selectedModelLabel
  }, [selectedModelLabel, actors[0]?.modelLabel, actors.length])

  const handleClick = () => {
    if (hasActorOverrides) {
      if (isMobile) {
        navigate('/initial')
      } else {
        navigate('/chats/' + selectedChat?.id)
      }
    } else if (!selectedConnection) {
      navigate('/models')
    } else {
      navigate('/models/' + selectedConnection.id)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="w-full !cursor-pointer rounded-md border-2 border-base-content/20 hover:!border-base-content/30 hover:bg-base-100 disabled:opacity-20"
    >
      <Input
        isReadOnly
        label={label}
        variant="bordered"
        value={modelValue}
        size={isMobile || !selectedModelLabel ? 'sm' : undefined}
        className="pointer-events-none w-full !cursor-pointer bg-transparent"
        classNames={{
          inputWrapper: twMerge(
            'btn !cursor-pointer border-none p-2 pr-1 !min-h-0 rounded-md',
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
