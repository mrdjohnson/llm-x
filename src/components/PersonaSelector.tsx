import { useMemo } from 'react'
import _ from 'lodash'
import { Input } from '@heroui/react'
import useMedia from 'use-media'

import { connectionStore } from '~/core/connection/ConnectionStore'
import { personaStore } from '~/core/persona/PersonaStore'

import { NavButton } from '~/components/NavButton'
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
      className="w-full max-w-[600px] !cursor-pointer rounded-md border-2 border-base-content/20 hover:!border-base-content/30 hover:bg-base-100 disabled:opacity-20"
    >
      <Input
        isReadOnly
        label={label}
        variant="bordered"
        value={personaStore.selectedPersona?.name || 'No persona selected'}
        size={isMobile ? 'sm' : 'md'}
        className="pointer-events-none w-full !cursor-pointer bg-transparent"
        classNames={{
          inputWrapper: 'btn !cursor-pointer border-none p-2 pr-1 !min-h-0 rounded-md md:h-12',
          input: '!cursor-pointer',
          label: '!cursor-pointer mr-2',
          innerWrapper: '!cursor-pointer',
        }}
        endContent={
          <ChevronDown className="-rotate-90 place-self-center !stroke-[3px] text-base-content/45" />
        }
      />
    </NavButton>
  )
}

export default PersonaSelector
