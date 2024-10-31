import { types } from 'mobx-state-tree'
import { ChatStore, chatStore } from '~/core/ChatStore'
import { IncomingMessageStore, incomingMessageStore } from '~/core/IncomingMessageStore'

export const RootStore = types.model({
  chatStore: ChatStore,
  incomingMessageStore: IncomingMessageStore,
})

// @ts-expect-error honestly unsure why this is upset
RootStore.create({ chatStore, incomingMessageStore })
