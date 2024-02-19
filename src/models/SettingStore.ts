import { types, Instance, cast, flow } from 'mobx-state-tree'
import { persist } from 'mst-persist'
import _ from 'lodash'

const Model = types.model({
  name: types.identifier,
  model: types.string,
  digest: types.string,
})

export interface IModel extends Instance<typeof Model> {}

export const DefaultHost = 'http://localhost:11434'

export const SettingStore = types
  .model({
    host: types.maybe(types.string),
    models: types.optional(types.array(Model), []),
    _selectedModelName: types.maybeNull(types.string),
    theme: types.optional(types.string, 'dark'),
  })
  .actions(self => ({
    afterCreate() {
      console.log('settingStore created, host:', self.host)
      this.updateModels()
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

    updateModels: flow(function* updateModels() {
      const host = self.host || DefaultHost

      let data: Array<IModel> = []

      try {
        const response = yield fetch(`${host}/api/tags`)

        const json = yield response.json()

        data = json?.models as IModel[]
      } catch (e) {}

      self.models = cast(data)

      self._selectedModelName ||= self.models[0]?.name
    }),
  }))
  .views(self => ({
    get selectedModel(): IModel | undefined {
      return self.models.find(model => model.name === self._selectedModelName) || self.models[0]
    },
  }))

export const settingStore = SettingStore.create()

persist('settings', settingStore, { blacklist: ['models'] }).then(() => {
  console.log('updated store')
  settingStore.updateModels()
})
