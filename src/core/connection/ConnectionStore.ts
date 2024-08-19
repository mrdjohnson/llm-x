import _ from 'lodash'
import { makeAutoObservable } from 'mobx'

import EntityCache from '~/utils/EntityCache'

import { ConnectionTypes, LanguageModelTypes } from '~/core/connection/types'
import { connectionTable } from '~/core/connection/ConnectionTable'
import { ConnectionModel, ConnectionModelInput } from '~/core/connection/ConnectionModel'
import { connectionViewModelByType, ConnectionViewModelTypes } from '~/core/connection/viewModels'

import { settingStore } from '~/core/setting/SettingStore'
import { settingTable } from '~/core/setting/SettingTable'

class ConnectionStore {
  connectionCache = new EntityCache<ConnectionModel, ConnectionViewModelTypes>(connection => {
    return connectionViewModelByType[connection.type]().toViewModel(connection)
  })

  constructor() {
    makeAutoObservable(this)
  }

  get connections() {
    return connectionTable.cache.allValues().map(this.connectionCache.getOrPut)
  }

  get selectedConnection(): ConnectionViewModelTypes | undefined {
    const connection = connectionTable.findCachedById(settingStore.setting.selectedConnectionId)

    if (!connection) return undefined

    return this.connectionCache.getOrPut(connection)
  }

  get selectedModel() {
    const { selectedModelId } = settingStore.setting

    if (!selectedModelId || !this.selectedConnection) return undefined

    return _.find<LanguageModelTypes>(this.selectedConnection.models, { id: selectedModelId })
  }

  get selectedModelName() {
    return this.selectedModel?.modelName
  }

  get selectedModelLabel() {
    return this.selectedModel?.label
  }

  getConnectionById(id?: string) {
    if (!id) return

    return this.connectionCache.get(id)
  }

  async deleteConnection(connection: ConnectionViewModelTypes) {
    return await connectionTable.destroy(connection.source)
  }

  async addConnection(type: ConnectionTypes, input?: ConnectionModelInput) {
    const connection = await connectionTable.create(
      input ?? connectionViewModelByType[type]().getSnapshot(),
    )

    // it was just created by the table, we have not cached it here yet
    return this.connectionCache.put(connection, false)
  }

  async updateConnection(connection: ConnectionModel) {
    await connectionTable.put(connection)
  }

  async duplicateConnection(connection: ConnectionModel) {
    return this.addConnection(connection.type, connection)
  }

  async setSelectedConnection(connection: ConnectionViewModelTypes) {
    await settingTable.put({ selectedConnectionId: connection.id })
  }

  async setSelectedModel(selectedModelId: string, selectedConnectionId: string) {
    await settingTable.put({ selectedModelId, selectedConnectionId })
  }

  async refreshModels() {
    for (const connection of this.connections) {
      await connection.fetchLmModels()
    }
  }

  async updateDataModel(snapshot: ConnectionModel, isHostChanged: boolean) {
    const connection = await connectionTable.put(snapshot)

    const viewModel = this.connectionCache.getOrPut(connection)

    if (isHostChanged) {
      viewModel.fetchLmModels()
    }
  }

  get isAnyServerConnected() {
    return _.some(this.connections.map(connection => connection.isConnected))
  }

  get isImageGenerationMode() {
    return this.selectedConnection?.type === 'A1111'
  }
}

export const connectionStore = new ConnectionStore()
