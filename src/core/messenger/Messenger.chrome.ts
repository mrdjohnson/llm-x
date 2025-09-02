import { defineExtensionMessaging } from '@webext-core/messaging'

import {
  BaseMessenger,
  OnMessageType,
  ProtocolMap,
  SendMessageType,
} from '~/core/messenger/BaseMessenger'

class Messenger extends BaseMessenger {
  messaging = defineExtensionMessaging<ProtocolMap>()

  sendMessage: SendMessageType = (...args) => {
    // @ts-expect-error i'm passing the same requested args
    return this.messaging.sendMessage(...args)
  }

  onMessage: OnMessageType = (...args) => {
    return this.messaging.onMessage(...args)
  }
}

export const messenger = new Messenger()
