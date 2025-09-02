import { type defineExtensionMessaging } from '@webext-core/messaging'

export interface IMessenger {
  tabChanged(data?: { url: string; title: string }): void
}

type MessagingType = ReturnType<typeof defineExtensionMessaging<IMessenger>>
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
