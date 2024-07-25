import { types } from 'mobx-state-tree'
import { persist } from 'mst-persist'
import _ from 'lodash'

import { type SettingPanelOptionsType } from '~/features/settings/settingsPanels'

import { connectionModelStore } from '~/features/connections/ConnectionModelStore'
import LmsServerConnection from '~/features/connections/servers/LmsServerConnection'
import A1111ServerConnection from '~/features/connections/servers/A1111ServerConnection'
import OllamaServerConnection from '~/features/connections/servers/OllamaServerConnection'

import { VoiceModel } from '~/models/VoiceModel'

const SETTING_STORE_VERSION = 2

export const SettingStore = types
  .model({
    version: types.optional(types.number, SETTING_STORE_VERSION),

    selectedModelName: types.maybeNull(types.string),

    voice: types.maybe(VoiceModel),

    // general settings
    theme: types.optional(types.string, '_system'),
    pwaNeedsUpdate: types.optional(types.boolean, false),
    isSidebarOpen: types.optional(types.boolean, true),

    // app settings
    _settingsPanelName: types.maybe(types.string),
    _isServerConnected: types.maybe(types.boolean),
    _funTitle: types.maybe(types.string),
  })
  .views(self => ({
    get funTitle() {
      return self._funTitle
    },

    get settingsPanelName() {
      return self._settingsPanelName as SettingPanelOptionsType | undefined
    },
  }))
  .actions(self => {
    let updateServiceWorker: undefined | (() => void)

    return {
      toggleSidebar() {
        self.isSidebarOpen = !self.isSidebarOpen
      },

      openSettingsModal(panelName: SettingPanelOptionsType | 'initial' = 'initial') {
        self._settingsPanelName = panelName
      },

      closeSettingsModal() {
        self._settingsPanelName = undefined
      },

      setTheme(theme: string) {
        self.theme = theme
      },

      setPwaNeedsUpdate(pwaNeedsUpdate: boolean, nextUpdateServiceWorker?: () => void) {
        self.pwaNeedsUpdate = pwaNeedsUpdate
        updateServiceWorker = nextUpdateServiceWorker
      },

      setFunTitle(funTitle: string) {
        self._funTitle = funTitle
      },

      setVoice(language: string, voiceUri: string) {
        self.voice = VoiceModel.create({ language, voiceUri })
      },

      getUpdateServiceWorker() {
        return updateServiceWorker
      },
    }
  })

export const settingStore = SettingStore.create()

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

const migrateV2 = (settings: Record<string, unknown>) => {
  console.log('running v2 migration')

  if (settings.lmsEnabled) {
    const lmsSnapshot = _.cloneDeep(LmsServerConnection.getSnapshot())
    lmsSnapshot.host = (settings.lmsHost as string) || lmsSnapshot.host
    ;[['temperature', 'lmsTemperature']].forEach(([field, oldField]) => {
      const parameterIndex = _.findIndex(lmsSnapshot.parameters, { field })

      if (lmsSnapshot.parameters?.[parameterIndex]) {
        lmsSnapshot.parameters[parameterIndex].value = _.toString(settings[oldField])
      }
    })

    connectionModelStore.dataStore.addConnection('LMS', lmsSnapshot)
  }

  if (settings.a1111Enabled) {
    const a1111Snapshot = _.cloneDeep(A1111ServerConnection.getSnapshot())
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

    connectionModelStore.dataStore.addConnection('A1111', a1111Snapshot)
  }

  // it was enabled if it was true or undefined
  if (settings.ollamaEnabled !== false) {
    const ollamaSnapshot = _.cloneDeep(OllamaServerConnection.getSnapshot())
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

    connectionModelStore.dataStore.addConnection('Ollama', ollamaSnapshot)
  }

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

const runMigrations = () => {
  const settingsString = localStorage.getItem('settings')

  if (!settingsString) return

  const settings = JSON.parse(settingsString) as Record<string, unknown>

  if (_.isEqual(SETTING_STORE_VERSION, settings.version)) return

  migrateV1(settings)
  migrateV2(settings)

  settings.version = SETTING_STORE_VERSION

  localStorage.setItem('settings', JSON.stringify(settings))
}

runMigrations()

persist('settings', settingStore, {
  blacklist: [
    'models',
    'a1111Models',
    'pwaNeedsUpdate',
    '_isServerConnected',
    '_isA111ServerConnected',
    '_isLmsServerConnected',
    '_funTitle',
    '_settingsPanelName',
  ],
}).then(() => {
  console.log('updated settings store')
})
