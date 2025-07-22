import { describe, expect, test, beforeEach } from 'vitest'
import _ from 'lodash'

import { chatStore } from '~/core/chat/ChatStore'
import { initDb } from '~/core/db'
import { settingStore } from '~/core/setting/SettingStore'
import { SettingModel } from '~/core/setting/SettingModel'
import { ChatModelFactory } from '~/core/chat/ChatModel.factory'
import { ChatViewModel } from '~/core/chat/ChatViewModel'
import { ConnectionModelFactory } from '~/core/connection/ConnectionModel.factory'
import { connectionStore } from '~/core/connection/ConnectionStore'

describe('Setting', () => {
  let setting: SettingModel

  beforeEach(async () => {
    await initDb()

    setting = settingStore.setting
  })

  describe('Chat', () => {
    let originalChat: ChatViewModel

    beforeEach(async () => {
      originalChat = chatStore.selectedChat!
    })

    test('exists after init', () => {
      expect(originalChat.id).toBe(setting.selectedChatId)
    })

    test('updates when the id changes', async () => {
      // make the chat not empty
      await originalChat.addUserMessage('Message needed to create a new chat')

      // create a new, empty chat
      const nextChat = await ChatModelFactory.create()

      expect(nextChat.id).not.toBe(originalChat.id)

      //   see that the new chat is selected
      expect(chatStore.selectedChat!.id).toEqual(nextChat.id)
      expect(setting.selectedChatId).toEqual(nextChat.id)

      await chatStore.selectChat(originalChat)

      expect(chatStore.selectedChat).toBe(originalChat)
      expect(setting.selectedChatId).toBe(originalChat.id)
    })
  })

  describe('Connection', () => {
    test('does not exist originally', () => {
      expect(setting.selectedConnectionId).not.toBeDefined()
    })

    test('updates when the id changes', async () => {
      const [connection1, connection2] = await ConnectionModelFactory.createList(2)

      expect(setting.selectedConnectionId).toEqual(connection2.id)

      await connectionStore.setSelectedConnection(connection1)

      expect(setting.selectedConnectionId).toEqual(connection1.id)
    })
  })

  describe('Model', () => {
    test('does not exist originally', () => {
      expect(setting.selectedModelId).not.toBeDefined()
    })

    test('updates when the id changes', async () => {
      const connections = await ConnectionModelFactory.withOptions({
        connectionParams: { type: 'Ollama' },
        modelCount: 2,
      }).createList(2)
      const models = _.flatMap(connections, 'models')

      expect(setting.selectedModelId).not.toBeDefined()

      // fail if there are duplicate ids
      expect(_.uniqBy(models, 'id').length).toBe(4)

      //   test each connection/model pair
      for (const connection of connections) {
        for (const model of models) {
          await connectionStore.setSelectedModel(model.id, connection.id)

          expect(connection.id).toBeDefined()
          expect(model.id).toBeDefined()

          expect(setting).toMatchObject({
            selectedConnectionId: connection.id,
            selectedModelId: model.id,
          })
        }
      }
    })
  })
})
