import { BaseTable } from '~/core/BaseTable'
import { VoiceModel } from '~/core/voice/VoiceModel'
import { settingTable } from '~/core/setting/SettingTable'

export const VoiceTableName = 'Voice' as const

class VoiceTable extends BaseTable<typeof VoiceModel> {
  schema = VoiceModel

  getTableName() {
    return VoiceTableName
  }

  async clearCacheAndPreload() {
    const length = await voiceTable.length()

    if (length === 0) {
      const defaultVoice = await voiceTable.create({})

      await settingTable.put({ selectedVoiceId: defaultVoice.id })
    }
  }
}

export const voiceTable = new VoiceTable()
