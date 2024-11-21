import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router-dom'
import { type MouseEvent } from 'react'

import { NavButtonDiv } from '~/components/NavButton'

import SettingSection, { SettingSectionItem } from '~/containers/SettingSection'

import Edit from '~/icons/Edit'

import { PersonaModel } from '~/core/persona/PersonaModel'
import { personaTable } from '~/core/persona/PersonaTable'
import { personaStore } from '~/core/persona/PersonaStore'
import { settingTable } from '~/core/setting/SettingTable'

const EMPTY_PERSONA: PersonaModel = {
  // @ts-expect-error id's are not normally undefined
  id: undefined,
  name: 'No persona',
  description: '',
}

export const PersonaPanel = observer(() => {
  const { selectedPersona, personas } = personaStore
  const navigate = useNavigate()

  const personaToSectionItem = (persona: PersonaModel): SettingSectionItem<PersonaModel> => ({
    id: persona.id,
    label: persona.name,
    subLabels: [persona.description],
    data: persona,
  })

  const itemFilter = (persona: PersonaModel, filterText: string) => {
    return (
      persona.name.toLowerCase().includes(filterText) ||
      persona.description.toLowerCase().includes(filterText)
    )
  }

  const handlePersonaSelected = async (persona?: PersonaModel) => {
    await personaStore.setSelectedPersona(persona)
  }

  const createPersona = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    const persona = await personaTable.create({ name: 'Persona', description: '' })

    await settingTable.put({ selectedPersonaId: persona.id })

    navigate('/personas/' + persona.id)
  }

  const personaToActionRow = (persona: PersonaModel) => {
    if (!persona.id) return null

    return (
      <NavButtonDiv
        to={'/personas/' + persona.id}
        className="btn btn-ghost btn-sm ml-auto justify-start px-2"
      >
        <Edit />
      </NavButtonDiv>
    )
  }

  return (
    <SettingSection
      items={[EMPTY_PERSONA].concat(personas).map(personaToSectionItem)}
      filterProps={{
        helpText: 'Filter personas by name or description...',
        itemFilter,
        emptyLabel: 'No personas found',
      }}
      onItemSelected={persona => handlePersonaSelected(persona)}
      renderActionRow={personaToActionRow}
      selectedItemId={selectedPersona?.id}
      addButtonProps={{
        label: 'Add New Persona',
        onClick: e => createPersona(e),
      }}
      hasLargeItems
    />
  )
})

export default PersonaPanel
