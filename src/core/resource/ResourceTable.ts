import { BaseTable } from '~/core/BaseTable'
import { ResourceModel } from '~/core/resource/ResourceModel'

export const ResourceTableName = 'Resource' as const

class ResourceTable extends BaseTable<typeof ResourceModel> {
  schema = ResourceModel

  // todo: maybe this should be called "shouldSkipImportExport" or "canSave"?
  // skip the import / export process for now
  hasParentExportTable = true

  getModel() {
    return ResourceModel
  }

  getTableName() {
    return ResourceTableName
  }
}

export const resourceTable = new ResourceTable()
