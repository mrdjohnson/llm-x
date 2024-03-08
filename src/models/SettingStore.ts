import { RefObject } from 'react'
import { types, Instance, cast, flow } from 'mobx-state-tree'
import { persist } from 'mst-persist'
import _ from 'lodash'
import camelcaseKeys from 'camelcase-keys'

import { toastStore } from './ToastStore'

const ModelDetails = types.model({
  parameterSize: types.maybe(types.string),
  families: types.maybeNull(types.array(types.string)),
})

const Model = types
  .model({
    name: types.identifier,
    model: types.string,
    digest: types.string,
    modifiedAt: types.string,
    size: types.number,
    details: ModelDetails,
  })
  .views(self => ({
    // inspiration for gbSize and timeAgo are from chat-ollama!

    get gbSize() {
      return (self.size / 1e9).toFixed(2) + ' GB'
    },

    get timeAgo() {
      const modifiedAtDate = new Date(self.modifiedAt)
      const diffInSeconds = Math.floor((Date.now() - modifiedAtDate.getTime()) / 1000)
      const minutes = Math.floor(diffInSeconds / 60)
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)

      const pluralTimeAgo = (units: number) => (units !== 1 ? 's' : '') + ' ago'

      if (days > 0) return `${days} day${pluralTimeAgo(days)}`

      if (hours > 0) return `${hours} hour${pluralTimeAgo(hours)}`

      return `${minutes} minute${pluralTimeAgo(minutes)}`
    },

    get supportsImages() {
      return self.details.families?.includes('clip') || false
    },
  }))

export interface IModel extends Instance<typeof Model> {}

export const DefaultHost = 'http://localhost:11434'

const min_3 = 3 * 60 * 1000

export const SettingStore = types
  .model({
    host: types.maybe(types.string),
    models: types.optional(types.array(Model), []),
    _selectedModelName: types.maybeNull(types.string),
    theme: types.optional(types.string, '_system'),
    pwaNeedsUpdate: types.optional(types.boolean, false),
    lastHelpModalNotificationTime: types.optional(types.number, () => Date.now()),
    _isServerConnected: types.maybe(types.boolean),
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
        self._selectedModelName = name
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

      getUpdateServiceWorker() {
        return updateServiceWorker
      },

      updateModels: flow(function* updateModels() {
        const host = self.host || DefaultHost

        let data: Array<IModel> = []

        try {
          const response = yield fetch(`${host}/api/tags`)

          const json = yield response.json()

          data = camelcaseKeys(json?.models, { deep: true }) as IModel[]

          self._isServerConnected = true
        } catch (e) {
          toastStore.addToast('Failed to fetch models for host: ' + host, 'error')

          self._isServerConnected = false
        }

        self.models = cast(data)

        self._selectedModelName ||= self.models[0]?.name
      }),
    }
  })
  .views(self => ({
    get selectedModel(): IModel | undefined {
      return self.models.find(model => model.name === self._selectedModelName) || self.models[0]
    },

    get isServerConnected() {
      return self._isServerConnected
    },
  }))

export const settingStore = SettingStore.create()

persist('settings', settingStore, {
  blacklist: ['models', 'pwaNeedsUpdate', '_isServerConnected', '_selectedModelName'],
}).then(() => {
  console.log('updated store')
  settingStore.updateModels()
})
