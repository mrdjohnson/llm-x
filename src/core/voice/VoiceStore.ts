import { makeAutoObservable } from 'mobx'
import { voiceTable } from '~/core/voice/VoiceTable'
import { settingStore } from '~/core/setting/SettingStore'
import { VoiceModel } from '~/core/voice/VoiceModel'
import { settingTable } from '~/core/setting/SettingTable'

class VoiceStore {
  constructor() {
    makeAutoObservable(this)
  }

  get voices() {
    return voiceTable.cache.allValues()
  }

  get selectedVoice() {
    return voiceTable.findCachedById(settingStore.setting.selectedVoiceId)
  }

  async updateVoice(voice: VoiceModel) {
    await voiceTable.put(voice)
    await settingTable.put({ selectedVoiceId: voice.id })

    return voice
  }

  async findVoiceById(id: string) {
    return await voiceTable.findById(id)
  }
}

export const voiceStore = new VoiceStore()
