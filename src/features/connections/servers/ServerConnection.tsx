import { PropsWithoutRef, ReactNode } from 'react'
import { SnapshotIn } from 'mobx-state-tree'
import _ from 'lodash'
import { AxiosError } from 'axios'
import { IObservableArray, action, computed, observable } from 'mobx'

import { SortType as SelectionPanelSortType } from '~/components/SelectionTablePanel'
import { classFromProps } from '~/utils/classFromProps'
import BaseApi from '~/features/connections/api/BaseApi'

import { LanguageModelType } from '~/models/LanguageModel'
import { ConnectionTypes, IConnectionDataModel } from '~/models/types'
import { toastStore } from '~/models/ToastStore'

export type ServerConnectionModelPanel<BaseModel, T = ServerConnection<BaseModel>> = (props: {
  connection: T
}) => React.JSX.Element

abstract class ServerConnection<
  BaseModelType = object,
  SingleModelType = LanguageModelType<BaseModelType>,
> extends classFromProps<IConnectionDataModel>() {
  abstract DefaultHost: string

  abstract models: IObservableArray<LanguageModelType<BaseModelType>>

  abstract type: ConnectionTypes

  isConnected = false

  abstract modelTableHeaders: Array<SelectionPanelSortType<SingleModelType>>
  primaryHeader?: keyof SingleModelType = undefined

  abstract readonly hostLabel: string
  abstract readonly enabledLabel: string

  static getSnapshot(): SnapshotIn<IConnectionDataModel> {
    throw 'not implemented'
  }

  static MOBX_MAPPINGS = {
    models: observable,
    parsedParameters: computed,
    isConnected: observable,
    fetchLmModels: action,
  }

  get parsedParameters() {
    console.log('parsing parameters')

    return _.chain(this.parameters)
      .keyBy('field')
      .mapValues(parameter => parameter.parsedValue())
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

  async fetchLmModels() {
    const host = this.formattedHost
    const enabled = this.enabled

    if (!enabled || !host) return []

    try {
      const models = await this._fetchLmModels(host)

      this.models = observable.array(models)

      this.setIsConnected(true)

      console.log('%s of %s has %s models', this.id, this.type, this.models.length)

      return this.models
    } catch (e) {
      const status = (e instanceof AxiosError && e.status) || ''

      toastStore.addToast(
        `${status}: Failed to fetch ${this.type} models for ${this.label}; host: ${host}`,
        'error',
      )

      this.models = observable.array()

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
}

export default ServerConnection
