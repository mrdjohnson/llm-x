import { makeAutoObservable } from 'mobx'

import { SettingPanelOptionsType } from '~/features/settings/settingsPanels'
import { SettingModel } from '~/core/setting/SettingModel'
import { settingTable } from '~/core/setting/SettingTable'

class SettingStore {
  settingPanelName?: SettingPanelOptionsType
  funTitle?: string
  modelPanelConnectionId?: string

  constructor() {
    makeAutoObservable(this)
  }

  get setting() {
    return settingTable.findCachedById('setting')!
  }

  openSettingsModal(settingPanelName: SettingPanelOptionsType = 'initial') {
    this.settingPanelName = settingPanelName
  }

  closeSettingsModal() {
    this.settingPanelName = undefined
  }

  setFunTitle(title: string) {
    this.funTitle = title
  }

  setModelPanelOverride(connectionId?: string) {
    this.modelPanelConnectionId = connectionId

    if (connectionId) {
      this.openSettingsModal('models')
    }
  }

  async update(patch: Partial<SettingModel>) {
    return await settingTable.put(patch)
  }
}

export const settingStore = new SettingStore()
