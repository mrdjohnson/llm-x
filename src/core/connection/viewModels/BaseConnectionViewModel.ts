import { PropsWithoutRef, ReactNode } from 'react'
import _ from 'lodash'
import { AxiosError } from 'axios'
import { observable, computed, action, makeObservable, IObservableArray } from 'mobx'

import { SortType as SelectionPanelSortType } from '~/components/SelectionTablePanel'
import { classFromProps } from '~/utils/classFromProps'

import { LanguageModelType } from '~/core/LanguageModel'
import { toastStore } from '~/core/ToastStore'

import BaseApi from '~/core/connection/api/BaseApi'
import { ConnectionTypes } from '~/core/connection/types'
import { ConnectionModel, ConnectionParameterModel } from '~/core/connection/ConnectionModel'
import { settingTable } from '~/core/setting/SettingTable'

abstract class BaseConnectionViewModel<
  BaseModelType = object,
  SingleModelType = LanguageModelType<BaseModelType>,
> extends classFromProps<ConnectionModel>() {
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
    super(source)

    makeObservable(this, {
      models: observable,
      parsedParameters: computed,
      isConnected: observable,
      fetchLmModels: action,
    })

    if (autoFetch) {
      this.fetchLmModels()
    }
  }

  parsedParameterValue<T = string>(parameter: ConnectionParameterModel): T | undefined {
    const value = parameter.value || parameter.defaultValue

    if (!value) return undefined

    if (!parameter.isJson) return value as T

    return JSON.parse(value) as T
  }

  get parsedParameters() {
    console.log('parsing parameters')

    return _.chain(this.parameters)
      .keyBy('field')
      .mapValues(parameter => this.parsedParameterValue(parameter))
      .value()
  }

  setIsConnected(isConnected: boolean) {
    this.isConnected = isConnected
  }

  get formattedHost() {
    const host = this.host || this.DefaultHost

    if (host.endsWith('/')) return host.trim().substring(0, host.length - 1)

    return host.trim()
  }

  validateHost(): string | boolean {
    return true
  }

  protected abstract _fetchLmModels(host: string): Promise<Array<LanguageModelType<BaseModelType>>>

  async fetchLmModels({ skipFailedMessage = false } = {}) {
    const host = this.formattedHost
    const enabled = this.enabled

    if (!enabled || !host) return []

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

  abstract ModelPanel: <T extends typeof this>(
    props: PropsWithoutRef<{ connection: T }>,
  ) => ReactNode

  abstract api: BaseApi

  modelFilter(model: LanguageModelType<BaseModelType>, filterText: string) {
    return model.modelName.toLowerCase().includes(filterText.toLowerCase())
  }

  async selectModel(model?: LanguageModelType<BaseModelType>) {
    await settingTable.put({ selectedConnectionId: this.id, selectedModelId: model?.id })
  }
}

export type ConnectionViewModelPanel<BaseModel, T = BaseConnectionViewModel<BaseModel>> = (props: {
  connection: T
}) => React.JSX.Element

export { BaseConnectionViewModel }
