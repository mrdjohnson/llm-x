import { types, cast, flow, Instance } from 'mobx-state-tree'
import { persist } from 'mst-persist'
import camelcaseKeys from 'camelcase-keys'

import { toastStore } from '~/models/ToastStore'
import { IOllamaModel, OllamaModel } from '~/models/OllamaModel'
import { type SettingPanelOptionsType } from '~/features/settings/settingsPanels'
import _ from 'lodash'

export const DefaultHost = 'http://localhost:11434'
export const DefaultA1111Host = 'http://127.0.0.1:7860'

const A1111Model = types.model({
  title: types.string,
  modelName: types.string,
})

interface IA1111Model extends Instance<typeof A1111Model> {}

export const SettingStore = types
  .model({
    selectedModelType: types.optional(types.string, 'Ollama'),

    // ollama settings
    host: types.maybe(types.string),
    keepAliveTime: types.optional(types.number, 20),
    temperature: types.optional(types.number, 0.8),
    models: types.optional(types.array(OllamaModel), []),
    selectedModelName: types.maybeNull(types.string),

    // general settings
    theme: types.optional(types.string, '_system'),
    pwaNeedsUpdate: types.optional(types.boolean, false),

    // image generation settings
    a1111Enabled: types.maybe(types.boolean),
    a1111Host: types.maybe(types.string),
    a1111Models: types.array(A1111Model),
    _isA1111ServerConnected: types.maybe(types.boolean),
    a1111Width: types.maybe(types.number),
    a1111Height: types.maybe(types.number),
    a1111Steps: types.maybe(types.number),

    // app settings
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

      selectModel(name: string, modelType: 'Ollama' | 'A1111' = 'Ollama') {
        this.setModelType(modelType)

        self.selectedModelName = name
      },

      setModelType(modelType: 'Ollama' | 'A1111' = 'Ollama') {
        self.selectedModelType = modelType

        self.selectedModelName = null
      },

      setHost(host: string) {
        self.host = host
      },

      setKeepAliveTime(keepAliveTime: number) {
        self.keepAliveTime = keepAliveTime
      },

      setTemperature(temperature: number) {
        self.temperature = temperature
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

      setA1111Enabled(a1111Enabled: boolean) {
        // if we're turning this off
        if (self.a1111Enabled && !a1111Enabled) {
          self.selectedModelType = 'Ollama'
        }

        self.a1111Enabled = a1111Enabled
      },

      setA1111Host(a1111Host: string) {
        self.a1111Host = a1111Host
      },

      setA1111Size(width?: number, height?: number) {
        const constrain = (size?: number) => {
          if (size === undefined) return size

          if (size <= 0) return 512

          if (size > 99999) return 99999

          return size
        }

        self.a1111Width = constrain(width)
        self.a1111Height = constrain(height)
      },

      setA1111Steps(steps?: number) {
        self.a1111Steps = steps
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

      fetchA1111Models: flow(function* fetchA1111Models() {
        if (!self.a1111Enabled) return

        const a1111Host = self.a1111Host || DefaultA1111Host

        let data: Array<IA1111Model> = []

        try {
          const response = yield fetch(`${a1111Host}/sdapi/v1/sd-models`)

          const json = yield response.json()

          data = camelcaseKeys(json) as IA1111Model[]

          self._isA1111ServerConnected = true
        } catch (e) {
          toastStore.addToast('Failed to fetch models for a1111 host: ' + a1111Host, 'error')

          self._isServerConnected = false
        }

        self.a1111Models = cast(data)

        self.selectedModelName ||= self.models[0]?.name
      }),
    }
  })
  .views(self => ({
    get selectedModel(): IOllamaModel | undefined {
      return self.models.find(model => model.name === self.selectedModelName) || self.models[0]
    },

    get selectedA1111Model(): IA1111Model | undefined {
      const modelName = self.selectedModelName || undefined

      return _.find(self.a1111Models, { modelName }) || self.a1111Models[0]
    },

    get selectedModelLabel() {
      if (this.isImageGenerationMode) {
        return this.selectedA1111Model?.modelName
      } else {
        return this.selectedModel?.name
      }
    },

    get isServerConnected() {
      return self._isServerConnected
    },

    get isA1111ServerConnected() {
      return self._isServerConnected
    },

    get a1111ImageSize() {
      if (self.a1111Width === undefined || self.a1111Height === undefined) {
        return { width: undefined, height: undefined }
      }

      return { width: self.a1111Width, height: self.a1111Height }
    },

    get isAnyServerConnected() {
      return this.isA1111ServerConnected || this.isServerConnected
    },

    get funTitle() {
      return self._funTitle
    },

    get settingsPanelName() {
      return self._settingsPanelName as SettingPanelOptionsType | undefined
    },

    get isImageGenerationMode() {
      return self.selectedModelType === 'A1111'
    },

    get allModelsEmpty() {
      return _.isEmpty(self.models) && _.isEmpty(self.a1111Models)
    },
  }))

export const settingStore = SettingStore.create()

persist('settings', settingStore, {
  blacklist: [
    'models',
    'a1111Models',
    'pwaNeedsUpdate',
    '_isServerConnected',
    '_isA111ServerConnected',
    '_funTitle',
    '_settingsPanelName',
  ],
}).then(() => {
  console.log('updated store')
  settingStore.updateModels()
  settingStore.fetchA1111Models()
})
