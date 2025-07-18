import { describe, expect, test, beforeEach, afterEach } from 'vitest'

import { ActorViewModel } from '~/core/actor/ActorViewModel'
import { actorTable } from '~/core/actor/ActorTable'
import { actorStore } from '~/core/actor/ActorStore'
import { ActorModelFactory } from '~/core/actor/ActorModel.factory'

describe('ActorViewModel', () => {
  let actor: ActorViewModel

  beforeEach(async () => {
    await actorTable.clearCacheAndPreload()

    await ActorModelFactory.withOptions({ modelCount: 1 }).create()

    actor = actorStore.actors[0]
  })

  afterEach(async () => {
    await actorTable.clearCacheAndPreload()
  })

  test('connection returns a connection', () => {
    expect(actor.connection).toBeDefined()
    expect(actor.connection?.id).toBe(actor.source.connectionId)
  })

  test('model returns a model', () => {
    expect(actor.model?.id).toBeDefined()
    expect(actor.model?.id).toBe(actor.source.modelId)
  })

  test('modelName returns a string', () => {
    expect(typeof actor.modelName).toBe('string')
  })

  test('isConnected returns true if model exists', async () => {
    expect(actor.isConnected).toBe(true)

    await actor.removeConnection()

    expect(actor.isConnected).toBe(false)
  })

  test('update changes the actor', async () => {
    await actor.update({ name: 'Updated Name' })

    const updated = await actorTable.findById(actor.id)
    expect(updated!.name).toBe('Updated Name')
  })

  test('removeConnection clears connectionId and modelId', async () => {
    expect(actor.connection).toBeDefined()
    await actor.removeConnection()

    const updated = await actorTable.findById(actor.id)
    expect(updated!.connectionId).toBeNull()
    expect(updated!.modelId).toBeNull()
  })
})
