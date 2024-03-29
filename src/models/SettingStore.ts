import { types, cast, flow } from 'mobx-state-tree'
import { persist } from 'mst-persist'
import camelcaseKeys from 'camelcase-keys'

import { toastStore } from '~/models/ToastStore'
import { IOllamaModel, OllamaModel } from '~/models/OllamaModel'
import { type SettingPanelOptionsType } from '~/features/settings/settingsPanels'

export const DefaultHost = 'http://localhost:11434'

export const SettingStore = types
  .model({
    host: types.maybe(types.string),
    keepAliveTime: types.optional(types.number, 20),
    models: types.optional(types.array(OllamaModel), []),
    selectedModelName: types.maybeNull(types.string),
    theme: types.optional(types.string, '_system'),
    pwaNeedsUpdate: types.optional(types.boolean, false),
    lastHelpModalNotificationTime: types.optional(types.number, () => Date.now()),
    _settingsPanelName: types.maybe(types.string),
    _isServerConnected: types.maybe(types.boolean),
    _funTitle: types.maybe(types.string),
  })
  .actions(self => {
    let updateServiceWorker: undefined | (() => void)

    return {
      openSettingsModal(panelName: SettingPanelOptionsType | 'initial' = 'initial') {
        self._settingsPanelName = panelName
      },

      closeSettingsModal() {
        self._settingsPanelName = undefined
      },

      selectModel(name: string) {
        self.selectedModelName = name
      },

      setHost(host: string) {
        self.host = host
      },

      setKeepAliveTime(keepAliveTime: number) {
        self.keepAliveTime = keepAliveTime
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

      getUpdateServiceWorker() {
        return updateServiceWorker
      },

      updateModels: flow(function* updateModels() {
        const host = self.host || DefaultHost

        let data: Array<IOllamaModel> = []

        try {
          const response = yield fetch(`${host}/api/tags`)

          const json = yield response.json()

          data = camelcaseKeys(json?.models, { deep: true }) as IOllamaModel[]

          self._isServerConnected = true
        } catch (e) {
          toastStore.addToast('Failed to fetch models for host: ' + host, 'error')

          self._isServerConnected = false
        }

        self.models = cast(data)

        self.selectedModelName ||= self.models[0]?.name
      }),
    }
  })
  .views(self => ({
    get selectedModel(): IOllamaModel | undefined {
      return self.models.find(model => model.name === self.selectedModelName) || self.models[0]
    },

    get isServerConnected() {
      return self._isServerConnected
    },

    get funTitle() {
      return self._funTitle
    },

    get settingsPanelName() {
      return self._settingsPanelName as SettingPanelOptionsType | undefined
    },
  }))

export const settingStore = SettingStore.create()

persist('settings', settingStore, {
  blacklist: ['models', 'pwaNeedsUpdate', '_isServerConnected', '_funTitle', '_settingsPanelName'],
}).then(() => {
  console.log('updated store')
  settingStore.updateModels()
})
