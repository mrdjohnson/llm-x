import { useNavigate } from 'react-router'
import { connectionStore } from '~/core/connection/ConnectionStore'
import { personaStore } from '~/core/persona/PersonaStore'

const ModelAndPersonaDisplay = () => {
  const navigate = useNavigate()
  const { selectedModelLabel, selectedConnection, isAnyServerConnected } = connectionStore
  const persona = personaStore.selectedPersona?.name

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
    <div className="flex space-x-2">
      {isAnyServerConnected && (
        <div className="badge cursor-pointer gap-2 bg-base-300" onClick={handleModelClick}>
          Model: {selectedModelLabel}
        </div>
      )}
      {persona && (
        <div className="badge cursor-pointer gap-2 bg-base-300" onClick={handlePersonaClick}>
          Persona: {persona}
        </div>
      )}
    </div>
  )
}

export default ModelAndPersonaDisplay
