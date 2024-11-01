import { SnapshotIn, applySnapshot, destroy, getSnapshot, types } from 'mobx-state-tree'
import { persist } from 'mst-persist'
import _ from 'lodash'
import { makeAutoObservable } from 'mobx'

import { ConnectionDataModel } from '~/core/connection/ConnectionDataModel'
import LmsConnectionViewModel from '~/core/connection/viewModels/LmsConnectionViewModel'
import A1111ConnectionViewModel from '~/core/connection/viewModels/A1111ConnectionViewModel'
import OllamaConnectionViewModel from '~/core/connection/viewModels/OllamaConnectionViewModel'
import OpenAiConnectionViewModel from '~/core/connection/viewModels/OpenAiConnectionViewModel'
import { ConnectionViewModelTypes, connectionViewModelByType } from '~/core/connection/viewModels'

import { ConnectionTypes, IConnectionDataModel, BaseLanguageModel } from '~/core/types'

const ConnectionDataModelStore = types
  .model({
    connections: types.array(ConnectionDataModel),
    selectedConnection: types.safeReference(ConnectionDataModel),

    selectedModelName: types.maybe(types.string),
    selectedModelLabel: types.maybe(types.string),
  })
  .actions(self => ({
    addConnection(type: ConnectionTypes, snapshot?: SnapshotIn<IConnectionDataModel>) {
      const connection = ConnectionDataModel.create(
        snapshot ?? connectionViewModelByType[type].getSnapshot(),
      )

      self.connections.push(connection)
      self.selectedConnection = connection

      return connection
    },

    deleteConnection(id: string) {
      const connection = _.find(self.connections, { id })

      destroy(connection)

      if (id === self.selectedConnection?.id) {
        self.selectedConnection = undefined
      }
    },

    updateConnection(snapshot: SnapshotIn<IConnectionDataModel>) {
      const connection = _.find(self.connections, { id: snapshot.id })

      if (!connection) throw 'No connection found by that id'

      applySnapshot(connection, snapshot)

      return connection
    },

    setSelectedConnectionById(id: string) {
      self.selectedConnection = _.find(self.connections, { id })
    },

    setSelectedModel(model: BaseLanguageModel, connectionId: string) {
      self.selectedModelName = model.modelName
      self.selectedModelLabel = model.label

      this.setSelectedConnectionById(connectionId)
    },
  }))

const connectionDataModelStore = ConnectionDataModelStore.create()

const classMap: Record<
  ConnectionTypes,
  | typeof LmsConnectionViewModel
  | typeof A1111ConnectionViewModel
  | typeof OllamaConnectionViewModel
  | typeof OpenAiConnectionViewModel
> = {
  LMS: LmsConnectionViewModel,
  A1111: A1111ConnectionViewModel,
  Ollama: OllamaConnectionViewModel,
  OpenAi: OpenAiConnectionViewModel,
}
class ConnectionStore {
  dataStore = connectionDataModelStore

  private connectionMapById: Record<string, ConnectionViewModelTypes> = {}

  constructor() {
    makeAutoObservable(this)
  }

  get selectedModelName() {
    return this.dataStore.selectedModelName
  }

  get selectedModelLabel() {
    return this.dataStore.selectedModelLabel
  }

  get selectedConnectionModelId() {
    return this.dataStore.selectedConnection?.id
  }

  getConnectionById(id?: string) {
    if (!id) return

    return this.connectionMapById[id]
  }

  deleteConnection(id: string) {
    delete this.connectionMapById[id]

    this.dataStore.deleteConnection(id)
  }

  addConnection(type: ConnectionTypes, snapshot?: SnapshotIn<IConnectionDataModel>) {
    const connection = this.dataStore.addConnection(type, snapshot)

    const connectionViewModel = this.createConnectionViewModel(connection)

    connectionViewModel.fetchLmModels()
  }

  duplicateConnection(id: string) {
    const connection = _.find(this.dataStore.connections, { id })

    if (!connection) throw 'Cannot find connection'

    const snapshot = getSnapshot(connection)

    this.addConnection(snapshot.type, _.omit(snapshot, 'id'))
  }

  updateDataModel(snapshot: SnapshotIn<IConnectionDataModel>, isHostChanged: boolean) {
    const connection = this.dataStore.updateConnection(snapshot)

    const connectionViewModel = this.createConnectionViewModel(connection)

    if (isHostChanged) {
      connectionViewModel.fetchLmModels()
    }
  }

  createConnectionViewModel(connectionData: IConnectionDataModel) {
    const ServerClass = classMap[connectionData.type]

    const connectionViewModel = new ServerClass(connectionData)

    this.connectionMapById[connectionData.id] = connectionViewModel

    return connectionViewModel
  }

  get selectedConnection() {
    if (!this.selectedConnectionModelId) return undefined
    return this.connectionMapById[this.selectedConnectionModelId]
  }

  get connections() {
    return this.dataStore.connections.map(connectionData => {
      const savedConnection = this.connectionMapById[connectionData.id]
      if (savedConnection) return savedConnection

      this.createConnectionViewModel(connectionData)

      return this.connectionMapById[connectionData.id]
    })
  }

  get isAnyServerConnected() {
    return _.some(this.connections.map(connection => connection.isConnected))
  }

  get isImageGenerationMode() {
    return this.selectedConnection?.type === 'A1111'
  }

  refreshModels = () => {
    this.connections.map(connection => connection.fetchLmModels())
  }
}

export const connectionStore = new ConnectionStore()

persist('connection-store', connectionDataModelStore).then(() => {
  connectionStore.refreshModels()
})
