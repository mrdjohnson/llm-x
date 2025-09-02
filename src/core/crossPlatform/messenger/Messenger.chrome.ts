import { defineExtensionMessaging } from '@webext-core/messaging'

import {
  BaseMessenger,
  OnMessageType,
  IMessenger,
  SendMessageType,
} from '~/core/crossPlatform/messenger/BaseMessenger'

class ChromeMessenger extends BaseMessenger {
  messaging = defineExtensionMessaging<IMessenger>()

  sendMessage: SendMessageType = (...args) => {
    // @ts-expect-error i'm passing the same requested args
    return this.messaging.sendMessage(...args)
  }

  onMessage: OnMessageType = (...args) => {
    return this.messaging.onMessage(...args)
  }
}

export const messenger = new ChromeMessenger()
