import _ from 'lodash'
import { makeAutoObservable } from 'mobx'

import { resourceTable } from '~/core/resource/ResourceTable'
import { ResourceModel } from '~/core/resource/ResourceModel'
import { documentTable } from '~/core/resource/document/DocumentTable'

export class ResourceViewModel {
  constructor(public source: ResourceModel) {
    makeAutoObservable(this)
  }

  loadDocument() {
    return documentTable.findById(this.source.documentId)
  }

  get id() {
    return this.source.id
  }

  get document() {
    return documentTable.findCachedById(this.source.documentId)
  }

  async update(patch: Partial<ResourceModel>) {
    await resourceTable.put({ ...this.source, ...patch })
  }
}
