import _ from 'lodash'

import { SettingModel } from '~/core/setting/SettingModel'
import { importLegacySettingStore } from '~/core/setting/importLegacySettingStore'

import { BaseTable } from '~/core/BaseTable'
import { personaTable } from '~/core/persona/PersonaTable'
import { chatTable } from '~/core/chat/ChatTable'
import { connectionTable } from '~/core/connection/ConnectionTable'
import { voiceTable } from '~/core/voice/VoiceTable'

export const SettingTableName = 'Setting' as const

class SettingTable extends BaseTable<typeof SettingModel> {
  schema = SettingModel

  getModel() {
    return SettingModel
  }

  getTableName(): string {
    return SettingTableName
  }

  async importFromLegacy(data: unknown) {
    return importLegacySettingStore(data)
  }

  async clearCacheAndPreload() {
    await super.clearCacheAndPreload()

    // pre-load the only setting
    let settingSingleton = await settingTable.findById('setting')

    if (!settingSingleton) {
      settingSingleton = settingTable.parse({})
      settingSingleton.id = 'setting'

      this.put(settingSingleton)
    }

    await this.preloadSelectedEntities(settingSingleton)
  }

  async put(settingPartial: Partial<SettingModel>) {
    const oldSetting = this.findCachedById('setting')!

    await this.preloadSelectedEntities(settingPartial)

    return await super.put({ ...oldSetting, ...settingPartial })
  }

  async preloadSelectedEntities(settingPartial: Partial<SettingModel>) {
    if (settingPartial.selectedPersonaId) {
      await personaTable.findById(settingPartial.selectedPersonaId)
    }

    if (settingPartial.selectedChatId) {
      await chatTable.findById(settingPartial.selectedChatId)
    }

    if (settingPartial.selectedConnectionId) {
      await connectionTable.findById(settingPartial.selectedConnectionId)
    }

    if (settingPartial.selectedVoiceId) {
      await voiceTable.findById(settingPartial.selectedVoiceId)
    }
  }
}

export const settingTable = new SettingTable()
