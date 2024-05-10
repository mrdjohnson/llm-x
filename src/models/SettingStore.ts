import { types, cast, flow, Instance } from 'mobx-state-tree'
import { persist } from 'mst-persist'
import camelcaseKeys from 'camelcase-keys'
import { LMStudioClient, type DownloadedModel } from '@lmstudio/sdk'

import { toastStore } from '~/models/ToastStore'
import { IOllamaModel, OllamaModel } from '~/models/OllamaModel'
import { type SettingPanelOptionsType } from '~/features/settings/settingsPanels'
import _ from 'lodash'
import axios, { AxiosError } from 'axios'
import { lmsStore } from '~/features/lmstudio/LmsStore'

export const DefaultHost = 'http://localhost:11434'
export const DefaultA1111Host = 'http://127.0.0.1:7860'
export const DefaultLmsHost = 'ws://127.0.0.1:1234'

const A1111Model = types.model({
  title: types.string,
  modelName: types.string,
})

export type ConnectionTypes = 'Ollama' | 'A1111' | 'LMS'

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
    isSidebarOpen: types.optional(types.boolean, true),

    // image generation settings
    a1111Enabled: types.optional(types.boolean, false),
    a1111Host: types.maybe(types.string),
    a1111Models: types.array(A1111Model),
    _isA1111ServerConnected: types.maybe(types.boolean),
    a1111Width: types.maybe(types.number),
    a1111Height: types.maybe(types.number),
    a1111Steps: types.maybe(types.number),
    a1111BatchSize: types.optional(types.number, 1),

    // lms generation settings
    lmsEnabled: types.optional(types.boolean, false),
    lmsHost: types.maybe(types.string),
    _isLmsServerConnected: types.optional(types.boolean, false),
    lmsTemperature: types.optional(types.number, 0.8),

    // app settings
    _settingsPanelName: types.maybe(types.string),
    _isServerConnected: types.maybe(types.boolean),
    _funTitle: types.maybe(types.string),
  })
  .views(self => ({
    get modelType(): ConnectionTypes {
      return self.selectedModelType as ConnectionTypes
    },

    get selectedModel(): IOllamaModel | undefined {
      if (this.modelType !== 'Ollama') return undefined

      return self.models.find(model => model.name === self.selectedModelName) || self.models[0]
    },

    get selectedA1111Model(): IA1111Model | undefined {
      if (this.modelType !== 'A1111') return undefined

      const modelName = self.selectedModelName || undefined

      return _.find(self.a1111Models, { modelName }) || self.a1111Models[0]
    },

    get selectedLmsModel() {
      if (this.modelType !== 'LMS') return undefined

      const path = self.selectedModelName || undefined

      return _.find(this.lmsModels, { path }) || this.lmsModels[0]
    },

    get selectedModelLabel() {
      if (this.modelType === 'A1111') {
        return this.selectedA1111Model?.modelName
      } else if (this.modelType === 'LMS') {
        return this.selectedLmsModel?.name
      }

      return this.selectedModel?.name
    },

    get isServerConnected() {
      return self._isServerConnected
    },

    get isA1111ServerConnected() {
      return self._isA1111ServerConnected
    },

    get a1111ImageSize() {
      if (self.a1111Width === undefined || self.a1111Height === undefined) {
        return { width: undefined, height: undefined }
      }

      return { width: self.a1111Width, height: self.a1111Height }
    },

    get isLmsServerConnected() {
      return self._isLmsServerConnected
    },

    get isAnyServerConnected() {
      return this.isA1111ServerConnected || this.isServerConnected || this.isLmsServerConnected
    },

    get funTitle() {
      return self._funTitle
    },

    get settingsPanelName() {
      return self._settingsPanelName as SettingPanelOptionsType | undefined
    },

    get isImageGenerationMode() {
      return this.modelType === 'A1111'
    },

    get lmsModels() {
      return lmsStore.lmsModels
    },

    get allModelsEmpty() {
      return _.isEmpty(self.models) && _.isEmpty(self.a1111Models) && _.isEmpty(this.lmsModels)
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

      selectModel(name: string, modelType: ConnectionTypes = 'Ollama') {
        console.log('selecting: ', name, modelType)

        this.setModelType(modelType)

        self.selectedModelName = name
      },

      setModelType(modelType: ConnectionTypes = 'Ollama') {
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
        if (!a1111Enabled) {
          self._isA1111ServerConnected = false

          if (self.modelType === 'A1111') {
            this.setModelType('Ollama')
          }
        } else {
          self.selectedModelType = 'A1111'
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

      setA1111BatchSize(batchSize: number = 0) {
        self.a1111BatchSize = batchSize
      },

      setLmsEnabled(lmsEnabled: boolean) {
        // if we're turning this off
        if (!lmsEnabled) {
          self._isLmsServerConnected = false

          if (self.modelType === 'LMS') {
            this.setModelType('Ollama')
          }
        } else {
          this.setModelType('LMS')
        }

        self.lmsEnabled = lmsEnabled
      },

      setLmsHost(host?: string) {
        self.lmsHost = host
      },

      setLmsTemperature(temperature: number) {
        self.lmsTemperature = temperature
      },

      getUpdateServiceWorker() {
        return updateServiceWorker
      },

      refreshAllModels() {
        this.updateModels()
        this.fetchA1111Models()
        this.fetchLmsModels()
      },

      updateModels: flow(function* updateModels() {
        const host = self.host || DefaultHost

        let data: Array<IOllamaModel> = []

        try {
          const response = yield axios.get(`${host}/api/tags`)

          data = camelcaseKeys(response.data?.models, { deep: true }) as IOllamaModel[]

          self._isServerConnected = true
        } catch (e) {
          const status = (e instanceof AxiosError && e.status) || ''

          toastStore.addToast(status + ' Failed to fetch models for host: ' + host, 'error')

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
          const response = yield axios.get(`${a1111Host}/sdapi/v1/sd-models`)

          data = camelcaseKeys(response.data) as IA1111Model[]

          self._isA1111ServerConnected = true
        } catch (e) {
          const status = (e instanceof AxiosError && e.status) || ''

          toastStore.addToast(
            status + ' Failed to fetch models for a1111 host: ' + a1111Host,
            'error',
          )

          self._isA1111ServerConnected = false
        }

        self.a1111Models = cast(data)

        self.selectedModelName ||= self.a1111Models[0]?.title
      }),

      fetchLmsModels: flow(function* fetchA1111Models() {
        if (!self.lmsEnabled) return

        const lmsHost = self.lmsHost || DefaultLmsHost

        const client = new LMStudioClient({ baseUrl: lmsHost })

        try {
          const response: DownloadedModel[] = yield client.system.listDownloadedModels()

          lmsStore.setLmsModels(_.filter(response, { type: 'llm' }))

          self._isLmsServerConnected = true
        } catch (e) {
          const status = (e instanceof AxiosError && e.status) || ''

          toastStore.addToast(
            status + ' Failed to fetch models for lm studio host: ' + lmsHost,
            'error',
          )

          self._isLmsServerConnected = false
        }

        self.selectedModelName ||= self.lmsModels[0]?.path
      }),
    }
  })

export const settingStore = SettingStore.create()

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
  console.log('updated store')
  settingStore.updateModels()
  settingStore.fetchA1111Models()
  settingStore.fetchLmsModels()
})
