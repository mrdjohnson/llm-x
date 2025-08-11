import { useMemo } from 'react'
import _ from 'lodash'
import { useNavigate } from 'react-router'
import useMedia from 'use-media'

import ChevronDown from '~/icons/ChevronDown'
import FormInput from '~/components/form/FormInput'

import { connectionStore } from '~/core/connection/ConnectionStore'
import { chatStore } from '~/core/chat/ChatStore'

const NO_SERVERS_CONNECTED = 'No Servers connected'

const ModelSelector = () => {
  const navigate = useNavigate()

  const isMobile = useMedia('(max-width: 768px)')

  const { selectedModelLabel, isAnyServerConnected, selectedConnection } = connectionStore
  const noServer = !isAnyServerConnected

  const selectedChat = chatStore.selectedChat
  const actors = selectedChat?.actors || []
  const hasActorOverrides = !_.isEmpty(actors)

  const label = useMemo(() => {
    if (isMobile) {
      return undefined
    }

    if (noServer) {
      return NO_SERVERS_CONNECTED
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
    if (noServer) {
      return isMobile ? NO_SERVERS_CONNECTED : ''
    }

    if (actors[0]) {
      const value = actors[0]?.modelLabel

      if (actors.length > 1) {
        return `${value} (+${actors.length - 1})`
      }

      return value + ' (chat)'
    }

    return selectedModelLabel
  }, [selectedModelLabel, actors[0]?.modelLabel, actors.length, noServer, isMobile])

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
      <FormInput
        readOnly
        label={label}
        variant="bordered"
        value={modelValue}
        className="pointer-events-none"
        rightSection={
          <ChevronDown className="-rotate-90 place-self-center !stroke-[3px] text-base-content/45" />
        }
      />
    </button>
  )
}

export default ModelSelector
