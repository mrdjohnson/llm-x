import _ from 'lodash'
import { makeAutoObservable } from 'mobx'

import EntityCache from '~/utils/EntityCache'

import { ResourceModel, ResourceModelInput } from '~/core/resource/ResourceModel'
import { resourceTable } from '~/core/resource/ResourceTable'
import { documentTable } from '~/core/resource/document/DocumentTable'

class ResourceStore {
  resourceViewModelCache = new EntityCache<ResourceModel>({
    schema: ResourceModel,
  })

  constructor() {
    makeAutoObservable(this)
  }

  get resources() {
    return resourceTable.cache
      .allValues()
      .map(resource => this.resourceViewModelCache.getOrPut(resource))
  }

  getResourceById = (resourceId: string) => {
    const resource = resourceTable.findCachedById(resourceId)

    if (resource) {
      return this.resourceViewModelCache.getOrPut(resource)
    }

    return undefined
  }

  async createResource(input: ResourceModelInput) {
    const resource = await resourceTable.create(input)

    return this.resourceViewModelCache.put(resource)
  }

  async updateResource(patch: ResourceModel) {
    await resourceTable.put(patch)
  }

  async destroyResource(resource: ResourceModel) {
    await documentTable.destroyById(resource.documentId)
    await resourceTable.destroy(resource)
  }
}

export const resourceStore = new ResourceStore()
