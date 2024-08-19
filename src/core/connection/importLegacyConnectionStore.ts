import { z } from 'zod'

import { connectionTable } from '~/core/connection/ConnectionTable'
import { settingTable } from '~/core/setting/SettingTable'

const LegacyConnectionParameterType = z.object({
  field: z.string(),
  label: z.string().optional(),
  defaultValue: z.string().optional(),
  helpText: z.string().optional(),
  types: z.array(z.literal('system').or(z.literal('valueRequired')).or(z.literal('fieldRequired'))),
  value: z.string().optional(),
  isJson: z.boolean().optional(),
})

const LegacyConnection = z.object({
  id: z.string(),
  label: z.string(),
  type: z.literal('LMS').or(z.literal('A1111')).or(z.literal('Ollama')).or(z.literal('OpenAi')),
  host: z.string().optional(),
  enabled: z.boolean(),
  parameters: z.array(LegacyConnectionParameterType),
})

const LegacyConnectionStore = z.object({
  connections: z.array(LegacyConnection),
  selectedConnection: z.string(),
  selectedModelName: z.string(),
  selectedModelLabel: z.string(),
})

export const importLegacyConnectionStore = async (entity: unknown) => {
  const { data: connectionStore } = LegacyConnectionStore.safeParse(entity)

  if (!connectionStore) return undefined

  const {
    connections,
    selectedConnection: oldSelectedConnectionId,
    selectedModelName,
  } = connectionStore

  let selectedConnectionId

  const records = connections.map(oldConnection => {
    const connection = connectionTable.parse(oldConnection)

    if (oldConnection.id === oldSelectedConnectionId) {
      selectedConnectionId = connection.id
    }

    return connection
  })

  await connectionTable.bulkInsert(records)

  if (selectedConnectionId) {
    await settingTable.put({
      selectedConnectionId,
      selectedModelId: `${selectedConnectionId}:${selectedModelName}`,
    })
  }

  return records
}
