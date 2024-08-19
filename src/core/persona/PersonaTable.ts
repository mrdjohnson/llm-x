import { BaseTable } from '~/core/BaseTable'
import { importLegacyPersonaStore } from '~/core/persona/importLegacyPersonaStore'
import { PersonaModel } from '~/core/persona/PersonaModel'

export const PersonaTableName = 'Persona' as const

class PersonaTable extends BaseTable<typeof PersonaModel> {
  schema = PersonaModel
  localStorageLocation = 'personas'

  getTableName() {
    return PersonaTableName
  }

  async importFromLegacy(data: unknown) {
    return await importLegacyPersonaStore(data)
  }

  async clearCacheAndPreload() {
    await this.all()
  }
}

export const personaTable = new PersonaTable()
