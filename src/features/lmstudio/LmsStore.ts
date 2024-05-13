import { makeAutoObservable } from 'mobx'
import { type DownloadedModel } from '@lmstudio/sdk'
import { toLmsModel } from '~/utils/lms/toLmsModel'

export type ILmsModel = ReturnType<typeof toLmsModel>

class LmsStore {
  lmsModels: ILmsModel[] = []

  constructor() {
    makeAutoObservable(this)
  }

  setLmsModels(lmsModels: DownloadedModel[]) {
    this.lmsModels = lmsModels?.map(toLmsModel) || []
  }
}

export const lmsStore = new LmsStore()
