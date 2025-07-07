import { connectionStore } from '~/core/connection/ConnectionStore'
import { personaStore } from '~/core/persona/PersonaStore'

const ModelAndPersonaDisplay = () => {
  const { selectedModelLabel, isAnyServerConnected } = connectionStore
  const persona = personaStore.selectedPersona?.name

  return (
    <div className="my-2 flex space-x-2">
      {isAnyServerConnected && (
        <div className="badge gap-2 bg-base-300">Model: {selectedModelLabel}</div>
      )}
      {persona && <div className="badge gap-2 bg-base-300">Persona: {persona}</div>}
    </div>
  )
}

export default ModelAndPersonaDisplay
