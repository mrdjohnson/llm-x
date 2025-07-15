import { useNavigate } from 'react-router'
import { useMemo } from 'react'
import { Button } from '@heroui/react'

import ChevronDown from '~/icons/ChevronDown'

import { chatStore } from '~/core/chat/ChatStore'
import { connectionStore } from '~/core/connection/ConnectionStore'
import { personaStore } from '~/core/persona/PersonaStore'

const ModelAndPersonaDisplay = () => {
  const navigate = useNavigate()

  const { selectedConnection, selectedModelLabel } = connectionStore
  const { selectedChat } = chatStore

  const selectedPersonaName = personaStore.selectedPersona?.name

  const modelButtonLabel = useMemo(() => {
    if (!selectedChat?.actors[0]) return selectedModelLabel

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
      <Button variant="light" size="sm" className="text-base-content/60" onPress={handleModelClick}>
        {modelButtonLabel ? `Model: ${modelButtonLabel}` : 'No models selected'}
        <ChevronDown className="size-3" />
      </Button>

      <Button
        variant="light"
        size="sm"
        className="text-base-content/60"
        onPress={handlePersonaClick}
      >
        {selectedPersonaName ? `Persona: ${selectedPersonaName}` : 'No personas selected'}
        <ChevronDown className="size-3" />
      </Button>
    </div>
  )
}

export default ModelAndPersonaDisplay
