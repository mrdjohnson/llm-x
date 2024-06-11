import { SnapshotIn, applySnapshot, destroy, types } from 'mobx-state-tree'
import { persist } from 'mst-persist'
import _ from 'lodash'
import { makeAutoObservable } from 'mobx'

import { ConnectionDataModel } from '~/features/connections/ConnectionDataModel'
import LmsServerConnection from '~/features/connections/servers/LmsServerConnection'
import A1111ServerConnection from '~/features/connections/servers/A1111ServerConnection'
import OllamaServerConnection from '~/features/connections/servers/OllamaServerConnection'
import OpenAiServerConnection from '~/features/connections/servers/OpenAiServerConnection'
import { ServerConnectionTypes, serverConnectionByType } from '~/features/connections/servers'

import { ConnectionTypes, IConnectionDataModel, BaseLanguageModel } from '~/models/types'

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
        snapshot ?? serverConnectionByType[type].getSnapshot(),
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
  | typeof LmsServerConnection
  | typeof A1111ServerConnection
  | typeof OllamaServerConnection
  | typeof OpenAiServerConnection
> = {
  LMS: LmsServerConnection,
  A1111: A1111ServerConnection,
  Ollama: OllamaServerConnection,
  OpenAi: OpenAiServerConnection,
}
class ConnectionModelStore {
  dataStore = connectionDataModelStore

  private connectionMapById: Record<string, ServerConnectionTypes> = {}

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

  addConnection(type: ConnectionTypes) {
    const connection = this.dataStore.addConnection(type)

    const serverConnection = this.createServerConnection(connection)

    serverConnection.fetchLmModels()
  }

  updateDataModel(snapshot: SnapshotIn<IConnectionDataModel>, isHostChanged: boolean) {
    const connection = this.dataStore.updateConnection(snapshot)

    const serverConnection = this.createServerConnection(connection)

    if (isHostChanged) {
      serverConnection.fetchLmModels()
    }
  }

  createServerConnection(connectionData: IConnectionDataModel) {
    const ServerClass = classMap[connectionData.type]

    const serverConnection = new ServerClass(connectionData)

    this.connectionMapById[connectionData.id] = serverConnection

    return serverConnection
  }

  get selectedConnection() {
    if (!this.selectedConnectionModelId) return undefined
    return this.connectionMapById[this.selectedConnectionModelId]
  }

  get connections() {
    return this.dataStore.connections.map(connectionData => {
      const savedConnection = this.connectionMapById[connectionData.id]
      if (savedConnection) return savedConnection

      this.createServerConnection(connectionData)

      return this.connectionMapById[connectionData.id]
    })
  }

  get isAnyServerConnected() {
    return _.some(this.connections.map(connection => connection.isConnected))
  }

  get isImageGenerationMode() {
    return this.selectedConnection?.type === 'A1111'
  }

  refreshModels() {
    this.connections.map(connection => connection.fetchLmModels())
  }
}

export const connectionModelStore = new ConnectionModelStore()

persist('connection-store', connectionDataModelStore).then(() => {
  connectionModelStore.refreshModels()
})
