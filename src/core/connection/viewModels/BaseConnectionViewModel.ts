import _ from 'lodash'
import { AxiosError } from 'axios'
import { observable, computed, action, makeObservable, IObservableArray } from 'mobx'

import { type SortType as SelectionPanelSortType } from '~/components/SelectionTablePanel'

import { LanguageModelType } from '~/core/LanguageModel'
import { toastStore } from '~/core/ToastStore'

import { getApiByType } from '~/core/connection/api/getApiByType'
import { ConnectionTypes } from '~/core/connection/types'
import { ConnectionModel, ConnectionParameterModel } from '~/core/connection/ConnectionModel'
import { settingTable } from '~/core/setting/SettingTable'
import { rewriteChromeUrl } from '~/utils/rewriteChromeUrl'

abstract class BaseConnectionViewModel<
  BaseModelType = object,
  SingleModelType extends { id: string } = LanguageModelType<BaseModelType>,
> {
  abstract DefaultHost: string

  models: IObservableArray<LanguageModelType<BaseModelType>> = observable.array()

  abstract type: ConnectionTypes

  isConnected = false

  abstract modelTableHeaders: Array<SelectionPanelSortType<SingleModelType>>
  primaryHeader?: keyof SingleModelType = undefined

  abstract readonly hostLabel?: string
  abstract readonly enabledLabel: string

  static getSnapshot(): ConnectionModel {
    throw 'not implemented'
  }

  constructor(
    public source: ConnectionModel,
    { autoFetch = true } = {},
  ) {
    makeObservable(this, {
      models: observable,
      id: computed,
      label: computed,
      formattedHost: computed,
      parsedParameters: computed,
      isConnected: observable,
      fetchLmModels: action,
    })

    if (autoFetch) {
      this.fetchLmModels()
    }
  }

  get id() {
    return this.source.id
  }

  get label() {
    return this.source.label
  }

  async getApi() {
    return getApiByType(this.type)
  }

  parsedParameterValue<T = string>(parameter: ConnectionParameterModel): T | undefined {
    const value = parameter.value || parameter.defaultValue

    if (!value) return undefined

    if (!parameter.isJson) return value as T

    return JSON.parse(value) as T
  }

  get parsedParameters() {
    console.log('parsing parameters')

    return _.chain(this.source.parameters)
      .keyBy('field')
      .mapValues(parameter => this.parsedParameterValue(parameter))
      .value()
  }

  setIsConnected(isConnected: boolean) {
    this.isConnected = isConnected
  }

  get formattedHost() {
    const host = this.source.host || this.DefaultHost

    if (host.endsWith('/')) return host.trim().substring(0, host.length - 1)

    return host.trim()
  }

  validateHost(): string | boolean {
    return true
  }

  protected abstract _fetchLmModels(host: string): Promise<Array<LanguageModelType<BaseModelType>>>

  async fetchLmModels({ skipFailedMessage = false } = {}) {
    const host = this.formattedHost
    const enabled = this.source.enabled

    if (!enabled || !host) return []

    await rewriteChromeUrl(this.source.host)

    try {
      this.models = observable.array(await this._fetchLmModels(host))

      this.setIsConnected(true)

      console.log('%s of %s has %s models', this.id, this.type, this.models.length)

      return this.models
    } catch (e) {
      console.log('failed to fetch: ', this.type)
      const status = (e instanceof AxiosError && e.status) || ''

      if (!skipFailedMessage) {
        toastStore.addToast(
          `${status}: Failed to fetch ${this.type} models for ${this.label}; host: ${host}`,
          'error',
        )
      }

      // remove all current models
      this.models.clear()

      this.setIsConnected(false)
    }

    return []
  }

  modelFilter(model: LanguageModelType<BaseModelType>, filterText: string) {
    return model.modelName.toLowerCase().includes(filterText.toLowerCase())
  }

  async selectModel(model?: LanguageModelType<BaseModelType>) {
    await settingTable.put({ selectedConnectionId: this.id, selectedModelId: model?.id })
  }

  getModelById(id?: string): LanguageModelType<BaseModelType> | undefined {
    if (!id) return undefined

    return _.find(this.models, model => model.id === id)
  }

  filteredModels(filterText: string) {
    if (!filterText) return this.models

    return this.models.filter(model => this.modelFilter(model, filterText))
  }
}

export type ConnectionViewModelPanel<BaseModel, T = BaseConnectionViewModel<BaseModel>> = (props: {
  connection: T
}) => React.JSX.Element

export { BaseConnectionViewModel }
