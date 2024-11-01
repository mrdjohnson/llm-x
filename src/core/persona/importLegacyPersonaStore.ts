import { z } from 'zod'

import { personaTable } from '~/core/persona/PersonaTable'
import { settingTable } from '~/core/setting/SettingTable'

const LegacyPersona = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
})

const LegacyPersonaStore = z.object({
  personas: z.array(LegacyPersona),
  selectedPersona: z.number().nullish(),
})

export const importLegacyPersonaStore = async (entity: unknown) => {
  const { data: legacyPersonaStore } = LegacyPersonaStore.safeParse(entity)

  if (!legacyPersonaStore) return undefined

  const { personas, selectedPersona } = legacyPersonaStore

  const records = []

  for await (const oldPersona of personas) {
    try {
      const persona = personaTable.parse({
        ...oldPersona,
      })

      if (oldPersona.id === selectedPersona) {
        await settingTable.put({ selectedPersonaId: persona.id })
      }

      records.push(persona)
    } catch (e) {
      console.error('Unable to parse persona: \n%s\n', JSON.stringify(oldPersona, null, 2))
    }
  }

  await personaTable.bulkInsert(records)

  return records
}
