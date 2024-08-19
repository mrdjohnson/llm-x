import _ from 'lodash'
import { z } from 'zod'

import { connectionTable } from '~/core/connection/ConnectionTable'
import { voiceTable } from '~/core/voice/VoiceTable'
import { settingTable } from '~/core/setting/SettingTable'

import { ConnectionModel } from '~/core/connection/ConnectionModel'
import LmsConnectionViewModel from '~/core/connection/viewModels/LmsConnectionViewModel'
import A1111ConnectionViewModel from '~/core/connection/viewModels/A1111ConnectionViewModel'
import OllamaConnectionViewModel from '~/core/connection/viewModels/OllamaConnectionViewModel'

const OLD_SETTING_STORE_VERSION = 2

const LegacyVoice = z.object({
  id: z.string(),
  language: z.string(),
  voiceUri: z.string(),
})

const LegacySettingStore = z.object({
  version: z.number().optional(),
  selectedModelName: z.string().nullable(),
  voice: LegacyVoice.optional(),
  theme: z.string().optional(),
  isSidebarOpen: z.boolean().optional(),
})

const migrateV1 = (settings: Record<string, unknown>) => {
  console.log('running v1 migration')

  if (!_.isUndefined(settings.host)) {
    settings.ollamaHost = settings.host
  }

  if (!_.isUndefined(settings.keepAliveTime)) {
    settings.ollamaKeepAliveTime = settings.keepAliveTime
  }

  if (!_.isUndefined(settings.temperature)) {
    settings.ollamaTemperature = settings.temperature
  }

  delete settings.host
  delete settings.keepAliveTime
  delete settings.temperature
}

const migrateV2 = async (settings: Record<string, unknown>) => {
  console.log('running v2 migration')

  const connectionSeeds: ConnectionModel[] = []

  if (settings.lmsEnabled) {
    const lmsSnapshot = _.cloneDeep(LmsConnectionViewModel.getSnapshot())
    lmsSnapshot.host = (settings.lmsHost as string) || lmsSnapshot.host
    ;[['temperature', 'lmsTemperature']].forEach(([field, oldField]) => {
      const parameterIndex = _.findIndex(lmsSnapshot.parameters, { field })

      if (lmsSnapshot.parameters?.[parameterIndex]) {
        lmsSnapshot.parameters[parameterIndex].value = _.toString(settings[oldField])
      }
    })

    connectionSeeds.push(lmsSnapshot)
  }

  if (settings.a1111Enabled) {
    const a1111Snapshot = _.cloneDeep(A1111ConnectionViewModel.getSnapshot())
    a1111Snapshot.host = (settings.a1111Host as string) || a1111Snapshot.host
    ;[
      ['width', 'a1111Width'],
      ['height', 'a1111Height'],
      ['steps', 'a1111Steps'],
      ['batch_size', 'a1111BatchSize'],
    ].forEach(([field, oldField]) => {
      const parameterIndex = _.findIndex(a1111Snapshot.parameters, { field })

      if (a1111Snapshot.parameters?.[parameterIndex]) {
        a1111Snapshot.parameters[parameterIndex].value = _.toString(settings[oldField])
      }
    })

    connectionSeeds.push(a1111Snapshot)
  }

  // it was enabled if it was true or undefined
  if (settings.ollamaEnabled !== false) {
    const ollamaSnapshot = _.cloneDeep(OllamaConnectionViewModel.getSnapshot())
    ollamaSnapshot.host = (settings.ollamaHost as string) || ollamaSnapshot.host
    ;[
      ['keep_alive', 'ollamaKeepAliveTime'],
      ['temperature', 'ollamaTemperature'],
    ].forEach(([field, oldField]) => {
      const parameterIndex = _.findIndex(ollamaSnapshot.parameters, { field })

      if (ollamaSnapshot.parameters?.[parameterIndex]) {
        ollamaSnapshot.parameters[parameterIndex].value = _.toString(settings[oldField])
      }
    })

    connectionSeeds.push(ollamaSnapshot)
  }

  await connectionTable.bulkInsert(connectionSeeds)

  delete settings.ollamaEnabled
  delete settings.ollamaHost
  delete settings.ollamaKeepAliveTime
  delete settings.ollamaTemperature
  delete settings.ollamaModels

  delete settings.a1111Enabled
  delete settings.a1111Host
  delete settings.a1111Models
  delete settings._isA1111ServerConnected
  delete settings.a1111Width
  delete settings.a1111Height
  delete settings.a1111Steps
  delete settings.a1111BatchSize

  delete settings.lmsEnabled
  delete settings.lmsHost
  delete settings._isLmsServerConnected
  delete settings.lmsTemperature
}

// old old legacy migrations here
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const runOldMigrations = async (settings: any) => {
  if (_.isEqual(OLD_SETTING_STORE_VERSION, settings.version)) return settings

  migrateV1(settings)
  await migrateV2(settings)

  settings.version = OLD_SETTING_STORE_VERSION

  return settings
}

export const importLegacySettingStore = async (entity: unknown) => {
  const migratedSettings = await runOldMigrations(entity)

  const { data: legacySetting } = LegacySettingStore.safeParse(migratedSettings)

  if (!legacySetting) return undefined

  const oldVoice = legacySetting?.voice
  let voice

  if (oldVoice) {
    voice = await voiceTable.create(oldVoice)
  }

  const setting = settingTable.findCachedById('setting')!

  const seed = settingTable.parse({
    ...legacySetting,
    ...setting,
    selectedVoiceId: voice?.id,
  })

  // there is only one row here, name it with a constant value
  seed.id = setting.id

  await settingTable.put(setting)

  return [seed]
}
