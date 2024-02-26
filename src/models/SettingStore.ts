import { types, Instance, cast, flow } from 'mobx-state-tree'
import { persist } from 'mst-persist'
import _ from 'lodash'
import camelcaseKeys from 'camelcase-keys'

import { toastStore } from './ToastStore'
import { RefObject } from 'react'

const ModelDetails = types.model({
  parameterSize: types.string,
})

const Model = types.model({
  name: types.identifier,
  model: types.string,
  digest: types.string,
  modifiedAt: types.string,
  size: types.number,
  details: ModelDetails,
})

export interface IModel extends Instance<typeof Model> {}

export const DefaultHost = 'http://localhost:11434'

const min_3 = 3 * 60 * 1000

export const SettingStore = types
  .model({
    host: types.maybe(types.string),
    models: types.optional(types.array(Model), []),
    _selectedModelName: types.maybeNull(types.string),
    theme: types.optional(types.string, '_system'),
    pwaNeedsUpdate: types.optional(types.boolean, true),
    lastHelpModalNotificationTime: types.optional(types.number, () => Date.now()),
  })
  .actions(self => {
    let updateServiceWorker: undefined | (() => void)
    let helpModalRef: RefObject<HTMLDialogElement>

    return {
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
        } catch (e) {
          toastStore.addToast('Failed to fetch models for host: ' + host, 'error')
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
  }))

export const settingStore = SettingStore.create()

persist('settings', settingStore, { blacklist: ['models', 'pwaNeedsUpdate'] }).then(() => {
  console.log('updated store')
  settingStore.updateModels()
})
