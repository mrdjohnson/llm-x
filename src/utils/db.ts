import moment from 'moment'
import localForage from 'localforage'

import {
  CURRENT_DB_TIMESTAMP,
  CURRENT_DB_TIMESTAMP_MILLISECONDS,
} from '~/core/setting/SettingModel'

import { chatTable } from '~/core/chat/ChatTable'
import { connectionTable } from '~/core/connection/ConnectionTable'
import { messageTable } from '~/core/message/MessageTable'
import { personaTable } from '~/core/persona/PersonaTable'
import { voiceTable } from '~/core/voice/VoiceTable'
import { settingTable } from '~/core/setting/SettingTable'
import { actorTable } from '~/core/actor/ActorTable'

export const DATABASE_TABLES = [
  messageTable,
  personaTable,
  chatTable,
  voiceTable,
  connectionTable,
  settingTable,
  actorTable,
]

export const initDb = async () => {
  // create the database
  const database = localForage.createInstance({ name: 'llm-x' })

  const savedSetting = await settingTable.findById('setting')
  let isMigrationNeeded = false

  if (!savedSetting) {
    const oldSetting = localStorage.getItem('settings')

    // if there is nothing in indexeddb but there is data in local storage
    if (oldSetting) {
      isMigrationNeeded = true
    }

    await settingTable.create({}, 'setting')
  } else if (moment(savedSetting.databaseTimestamp).isBefore(CURRENT_DB_TIMESTAMP)) {
    isMigrationNeeded = true
  }

  // set each collection to its table. seed the collection
  for (const table of DATABASE_TABLES) {
    if (isMigrationNeeded) {
      await table.migrate(savedSetting?.databaseTimestamp)
    }

    await table.clearCacheAndPreload()
  }

  if (isMigrationNeeded) {
    await settingTable.put({ databaseTimestamp: CURRENT_DB_TIMESTAMP_MILLISECONDS })
  }

  return database
}
