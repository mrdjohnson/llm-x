import { types } from 'mobx-state-tree'

import { ChatStore, chatStore } from '~/models/ChatStore'
import { IncomingMessageStore, incomingMessageStore } from '~/models/IncomingMessageStore'
import { ConnectionDataModelStore, connectionModelStore } from '~/features/connections/ConnectionModelStore'
import { ActorDataStore, actorStore } from '~/models/actor/ActorStore'

export const RootStore = types.model({
  chatStore: ChatStore,
  incomingMessageStore: IncomingMessageStore,
  connectionDataStore: ConnectionDataModelStore,
  actorDataStore: ActorDataStore,
})

RootStore.create({
  // @ts-expect-error honestly unsure why this is upset
  chatStore,
  // @ts-expect-error honestly unsure why this is upset
  incomingMessageStore,
  // @ts-expect-error honestly unsure why this is upset
  connectionDataStore: connectionModelStore.dataStore,
  // @ts-expect-error honestly unsure why this is upset
  actorDataStore: actorStore.dataStore,
})

console.log('created root store')
