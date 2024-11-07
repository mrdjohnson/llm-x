import { importLegacyConnectionStore } from '~/core/connection/importLegacyConnectionStore'

import { BaseTable } from '~/core/BaseTable'
import { ConnectionModel, ConnectionModelInput } from '~/core/connection/ConnectionModel'
import { settingTable } from '~/core/setting/SettingTable'

export const ConnectionTableName = 'Connection' as const

class ConnectionTable extends BaseTable<typeof ConnectionModel> {
  schema = ConnectionModel
  localStorageLocation = 'connection-store'

  getModel() {
    return ConnectionModel
  }

  getTableName() {
    return ConnectionTableName
  }

  async create(connection: ConnectionModelInput) {
    const result = await super.create(connection)

    await settingTable.put({ selectedConnectionId: result.id })

    return result
  }

  importFromLegacy(data: unknown) {
    return importLegacyConnectionStore(data)
  }

  async clearCacheAndPreload(): Promise<void> {
    super.clearCacheAndPreload()

    // preload all
    await this.all()
  }
}

export const connectionTable = new ConnectionTable()
