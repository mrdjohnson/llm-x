/*
input: mobx-state-tree model
goal: keep input at the same values across state instances

as of this time, there is no need to get the "current" values on model load
*/

import { IAnyType, IStateTreeNode, SnapshotOut, applySnapshot, onSnapshot } from 'mobx-state-tree'
import _ from 'lodash'

type SnapshotMessage<T extends IAnyType> = { snapshot: SnapshotOut<T> }

export default function locallySyncModelAcrossTabs<T extends IAnyType>(
  store: IStateTreeNode<T>,
  name: string,
) {
  const crossTabCommunicator = new BroadcastChannel('llm-x-' + name)

  // stop gap, without this every applySnapshot would also send its own onSnapshot
  // that means Tab A sends snapshotA, Tab B gets applies snapshotA, and then re-sends snapshotA (what it was changed to)
  // as expected when Tab A gets snapshotA, it applies it but since there are no new changes made it does not send another snapshot
  // TL;DR without this line would not be an infinite loop, but its more data being sent across the channel (increasing per tab) than need be
  let lastSnapshot: SnapshotOut<T> | undefined = undefined

  onSnapshot<SnapshotOut<T>>(store, (snapshot: SnapshotOut<T>) => {
    if (_.isEqual(snapshot, lastSnapshot)) return

    const snapshotMessage: SnapshotMessage<T> = { snapshot }

    crossTabCommunicator.postMessage(snapshotMessage)
    console.log('sending snapshop ', snapshot)
  })

  crossTabCommunicator.onmessage = (e: MessageEvent<SnapshotMessage<T>>) => {
    if (!e.isTrusted) return

    const { snapshot } = e.data

    lastSnapshot = snapshot

    applySnapshot<T>(store, snapshot)
    console.log('applied snapshot: ', snapshot)
  }

  addEventListener('beforeunload', event => {
    if (event.isTrusted) {
      crossTabCommunicator.close()
    }
  })
}
