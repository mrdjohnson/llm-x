import { RefObject } from 'react'
import { types, cast, flow } from 'mobx-state-tree'
import { persist } from 'mst-persist'
import camelcaseKeys from 'camelcase-keys'

import { toastStore } from './ToastStore'
import { IOllamaModel, OllamaModel } from './OllamaModel'

export const DefaultHost = 'http://localhost:11434'

const min_3 = 3 * 60 * 1000

export const SettingStore = types
  .model({
    host: types.maybe(types.string),
    models: types.optional(types.array(OllamaModel), []),
    selectedModelName: types.maybeNull(types.string),
    theme: types.optional(types.string, '_system'),
    pwaNeedsUpdate: types.optional(types.boolean, false),
    lastHelpModalNotificationTime: types.optional(types.number, () => Date.now()),
    _isServerConnected: types.maybe(types.boolean),
    _funTitle: types.maybe(types.string),
  })
  .actions(self => {
    let updateServiceWorker: undefined | (() => void)
    let helpModalRef: RefObject<HTMLDialogElement>
    let modelSelectionModalRef: RefObject<HTMLDialogElement>

    return {
      setModelSelectionModalRef(nextModelSelectionModalRef: RefObject<HTMLDialogElement>) {
        modelSelectionModalRef = nextModelSelectionModalRef
      },

      openModelSelectionModal() {
        modelSelectionModalRef.current?.showModal()
      },

      setHelpModalRef(nextHelpModalRef: RefObject<HTMLDialogElement>) {
        helpModalRef = nextHelpModalRef
      },

      openUpdateModal({ fromUser }: { fromUser: boolean }) {
        const now = Date.now()

        if (fromUser || now - self.lastHelpModalNotificationTime > min_3) {
          helpModalRef.current?.showModal()
          self.lastHelpModalNotificationTime = now
        }
      },

      selectModel(name: string) {
        self.selectedModelName = name
      },

      setHost(host: string) {
        self.host = host
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
  }))

export const settingStore = SettingStore.create()

persist('settings', settingStore, {
  blacklist: ['models', 'pwaNeedsUpdate', '_isServerConnected', '_funTitle'],
}).then(() => {
  console.log('updated store')
  settingStore.updateModels()
})
