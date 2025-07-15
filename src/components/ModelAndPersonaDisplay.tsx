import { useNavigate } from 'react-router'
import { useMemo } from 'react'
import { Button } from '@heroui/react'

import ChevronDown from '~/icons/ChevronDown'

import { chatStore } from '~/core/chat/ChatStore'
import { connectionStore } from '~/core/connection/ConnectionStore'
import { personaStore } from '~/core/persona/PersonaStore'

const ModelAndPersonaDisplay = () => {
  const navigate = useNavigate()

  const { selectedConnection } = connectionStore
  const { selectedChat } = chatStore

  const selectedPersonaName = personaStore.selectedPersona?.name

  const modelButtonLabel = useMemo(() => {
    if (!selectedChat?.actors[0]) return

    const [firstActor, ...otherActors] = selectedChat.actors

    if (otherActors.length > 0) {
      return `${firstActor.modelLabel} +${otherActors.length}`
    }

    return firstActor.modelLabel
  }, [selectedChat?.actors])

  const handleModelClick = () => {
    if (!selectedConnection) {
      navigate('/models')
    } else {
      navigate('/models/' + selectedConnection.id)
    }
  }

  const handlePersonaClick = () => {
    navigate('/personas')
  }

  return (
    <div className="mt-1 flex space-x-2">
      {selectedChat && (
        <Button
          variant="light"
          size="sm"
          className="text-base-content/60"
          onPress={handleModelClick}
        >
          Model: {modelButtonLabel}
          <ChevronDown className="size-3" />
        </Button>
      )}

      {selectedPersonaName && (
        <Button
          variant="light"
          size="sm"
          className="text-base-content/60"
          onPress={handlePersonaClick}
        >
          Persona: {selectedPersonaName} <ChevronDown className="size-3" />
        </Button>
      )}
    </div>
  )
}

export default ModelAndPersonaDisplay
