import { defineExtensionMessaging } from '@webext-core/messaging'

import { BaseMessenger, OnMessageType, SendMessageType } from '~/core/messenger/BaseMessenger'

interface ProtocolMap {
  pageContent: (pageContent?: string) => void
}

class Messenger extends BaseMessenger {
  messaging = defineExtensionMessaging<ProtocolMap>()

  sendMessage: SendMessageType = (...args) => {
    this.messaging.sendMessage(...args)
  }

  onMessage: OnMessageType = (...args) => {
    this.messaging.onMessage(...args)
  }
}

export const messenger = new Messenger()
