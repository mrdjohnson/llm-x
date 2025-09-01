import { type defineExtensionMessaging } from '@webext-core/messaging'
import _ from 'lodash'

interface ProtocolMap {
  pageContent(pageContent?: string): void
}

type MessagingType = ReturnType<typeof defineExtensionMessaging<ProtocolMap>>
export type SendMessageType = (...args: Parameters<MessagingType['sendMessage']>) => void
export type OnMessageType = (...args: Parameters<MessagingType['onMessage']>) => void

export class BaseMessenger {
  sendMessage: SendMessageType = () => {
    throw new Error('Method not implemented.')
  }

  onMessage: OnMessageType = () => {
    throw new Error('Method not implemented.')
  }
}
