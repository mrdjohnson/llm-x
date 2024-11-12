import { makeAutoObservable } from 'mobx'

import { SettingModel } from '~/core/setting/SettingModel'
import { settingTable } from '~/core/setting/SettingTable'

class SettingStore {
  funTitle?: string

  constructor() {
    makeAutoObservable(this)
  }

  get setting() {
    return settingTable.findCachedById('setting')!
  }

  setFunTitle(title: string) {
    this.funTitle = title
  }

  async update(patch: Partial<SettingModel>) {
    return await settingTable.put(patch)
  }
}

export const settingStore = new SettingStore()
