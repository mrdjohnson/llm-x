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

  getPersonaById(id: string) {
    return personaTable.findCachedById(id)
  }

  async setSelectedPersona(persona?: PersonaModel) {
    return await settingTable.put({ selectedPersonaId: persona?.id || null })
  }

  async duplicatePersona(persona: PersonaModel) {
    const duplicate = await personaTable.duplicate(persona)

    await settingTable.put({ selectedPersonaId: duplicate.id })
  }

  async destroyPersona(persona: PersonaModel) {
    return await personaTable.destroy(persona)
  }

  async destroyAllPersonas() {
    const personas = [...this.personas]

    for (const persona of personas) {
      await this.destroyPersona(persona)
    }
  }
}

export const personaStore = new PersonaStore()
