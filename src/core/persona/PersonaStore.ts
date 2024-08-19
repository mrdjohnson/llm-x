import { makeAutoObservable } from 'mobx'

import { PersonaModel } from '~/core/persona/PersonaModel'
import { personaTable } from '~/core/persona/PersonaTable'
import { settingTable } from '~/core/setting/SettingTable'
import { settingStore } from '~/core/setting/SettingStore'

class PersonaStore {
  personaToEdit?: PersonaModel = undefined

  constructor() {
    makeAutoObservable(this)
  }

  get personas() {
    return personaTable.cache.allValues()
  }

  get selectedPersona() {
    const personaId = settingStore.setting.selectedPersonaId || undefined

    const persona = personaTable.findCachedById(personaId)

    return persona
  }

  setPersonaToEdit(persona?: PersonaModel) {
    this.personaToEdit = persona
  }

  async setSelectedPersona(persona?: PersonaModel) {
    return await settingTable.put({ selectedPersonaId: persona?.id || null })
  }

  async duplicatePersona(persona: PersonaModel) {
    const duplicate = await personaTable.duplicate(persona)

    await settingTable.put({ selectedPersonaId: duplicate.id })
  }
}

export const personaStore = new PersonaStore()
