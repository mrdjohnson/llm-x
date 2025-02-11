import { BaseTable } from '~/core/BaseTable'
import { ActorModel } from '~/core/actor/ActorModel'

export const ActorTableName = 'Actor' as const

class ActorTable extends BaseTable<typeof ActorModel> {
  schema = ActorModel

  // skip the import / export process for now
  hasParentExportTable = true

  getModel() {
    return ActorModel
  }

  getTableName() {
    return ActorTableName
  }

  async clearCacheAndPreload() {
    await super.clearCacheAndPreload()

    await this.all()

    if (!this.findCachedById('knowledge')) {
      await this.create({}, 'knowledge')
    }
  }
}

export const actorTable = new ActorTable()
