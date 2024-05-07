import { makeAutoObservable } from 'mobx'
import { type DownloadedModel } from '@lmstudio/sdk'
import { toLmsModel } from '~/utils/lms/toLmsModel'

class LmsStore {
  lmsModels: ReturnType<typeof toLmsModel>[] = []

  constructor() {
    makeAutoObservable(this)
  }

  setLmsModels(lmsModels: DownloadedModel[]) {
    this.lmsModels = lmsModels?.map(toLmsModel) || []
  }
}

export const lmsStore = new LmsStore()
