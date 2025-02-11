import { type defineExtensionMessaging } from '@webext-core/messaging'
import _ from 'lodash'

interface ProtocolMap {
  pageContent: (pageContent?: string) => void
}

class Messenger {
  messaging!: ReturnType<typeof defineExtensionMessaging<ProtocolMap>>

  canMessage = __TARGET__ === 'chrome'

  async isMessagingDisabled() {
    if (this.canMessage) {
      if (this.messaging) return true

      const { defineExtensionMessaging } = await import('@webext-core/messaging')

      this.messaging = defineExtensionMessaging<ProtocolMap>()

      return true
    }

    return false
  }

  sendMessage(...args: Parameters<typeof this.messaging.sendMessage>) {
    this.isMessagingDisabled().then(enabled => {
      if (enabled) {
        this.messaging.sendMessage(...args)
      }
    })
  }

  onMessage(...args: Parameters<typeof this.messaging.onMessage>) {
    this.isMessagingDisabled().then(enabled => {
      if (enabled) {
        this.messaging.onMessage(...args)
      }
    })
  }

  // async onPageContent(callBack: ProtocolMap['pageContent']) {
  //   if (await this.isMessagingDisabled()) return

  //   this.messaging.onMessage('pageContent', message => {
  //     callBack(message.data)
  //   })
  // }
}

export const messenger = new Messenger()
