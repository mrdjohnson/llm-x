import { useMemo } from 'react'
import _ from 'lodash'
import useMedia from 'use-media'

import { connectionStore } from '~/core/connection/ConnectionStore'
import { personaStore } from '~/core/persona/PersonaStore'

import { NavButton } from '~/components/NavButton'
import FormInput from '~/components/form/FormInput'

import ChevronDown from '~/icons/ChevronDown'

const PersonaSelector = () => {
  const isMobile = useMedia('(max-width: 768px)')

  const label = useMemo(() => {
    return isMobile ? undefined : personaStore.selectedPersona && 'Persona'
  }, [isMobile])

  return (
    <NavButton
      tabIndex={0}
      to="/personas"
      disabled={connectionStore.isImageGenerationMode}
      className="h-fit max-h-fit w-full max-w-[600px] !cursor-pointer rounded-md border-2 border-base-content/20 text-left hover:!border-base-content/30 hover:bg-base-100 disabled:opacity-20"
    >
      <FormInput
        label={label}
        variant="bordered"
        value={personaStore.selectedPersona?.name || 'No persona selected'}
        className="pointer-events-none"
        rightSection={
          <ChevronDown className="-rotate-90 place-self-center !stroke-[3px] text-base-content/45" />
        }
      />
    </NavButton>
  )
}

export default PersonaSelector
