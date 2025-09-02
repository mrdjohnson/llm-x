import { type defineExtensionMessaging } from '@webext-core/messaging'

export interface ProtocolMap {
  pageContent(pageContent?: string): void
  tabChanged(data: { url: string; title: string }): void
}

type MessagingType = ReturnType<typeof defineExtensionMessaging<ProtocolMap>>
export type SendMessageType = MessagingType['sendMessage']
export type OnMessageType = MessagingType['onMessage']

export class BaseMessenger {
  sendMessage: SendMessageType = () => {
    throw new Error('Method not implemented.')
  }

  onMessage: OnMessageType = () => {
    throw new Error('Method not implemented.')
  }
}
