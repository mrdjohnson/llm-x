import { BaseTable } from '~/core/BaseTable'
import { DocumentModel } from '~/core/resource/document/DocumentModel'

export const DocumentTableName = 'Document' as const

class DocumentTable extends BaseTable<typeof DocumentModel> {
  schema = DocumentModel

  // skip the import / export process for now
  hasParentExportTable = true

  getModel() {
    return DocumentModel
  }

  getTableName() {
    return DocumentTableName
  }
}

export const documentTable = new DocumentTable()
