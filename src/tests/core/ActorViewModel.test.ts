import { describe, expect, test, beforeEach, afterEach } from 'vitest'

import { ActorViewModel } from '~/core/actor/ActorViewModel'
import { actorTable } from '~/core/actor/ActorTable'
import { actorStore } from '~/core/actor/ActorStore'
import { ActorModelFactory } from '~/core/actor/ActorModel.factory'
import { ConnectionModelFactory } from '~/core/connection/ConnectionModel.factory'
import { setServerResponseForOllamaShowByModelName } from '~/tests/helpers/setServerResponseForModels'

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

  test('isImageGenerator is true when A1111 model', async () => {
    const connection = await ConnectionModelFactory.withOptions({ modelCount: 2 }).create({
      type: 'A1111',
      host: 'http://a1111-host.com',
    })

    const imageActor = await ActorModelFactory.create({
      connectionId: connection.id,
      modelId: connection.models[1].id, // specify the second model
    })

    // uses the first model by default
    const imageActor2 = await ActorModelFactory.withOptions({ connection }).create()

    const imageActor3 = await ActorModelFactory.withOptions({
      connectionParams: { type: 'A1111' },
    }).create()

    expect(imageActor.isImageGenerator).toBe(true)
    expect(imageActor.model?.id).toBe(connection.models[1].id)

    expect(imageActor2.isImageGenerator).toBe(true)
    expect(imageActor2.model?.id).toBe(connection.models[0].id)

    expect(imageActor3.isImageGenerator).toBe(true)

    // expect all to be connected
    expect(imageActor.isConnected).toBe(true)
    expect(imageActor2.isConnected).toBe(true)
    expect(imageActor3.isConnected).toBe(true)
  })

  test('isImageGenerator is true when Ollama model has image capability', async () => {
    const connection = await ConnectionModelFactory.withOptions({ modelCount: 1 }).create({
      type: 'Ollama',
    })

    const modelName = connection.models[0].modelName

    // Clear the cache so it will refetch capabilities
    localStorage.removeItem(`ollama_model_capabilities_${connection.id}`)

    // Set up mock to return image capability for this model
    setServerResponseForOllamaShowByModelName(connection.formattedHost, modelName)

    // Refetch models to get the capabilities
    await connection.fetchLmModels()

    const imageActor = await ActorModelFactory.create({
      connectionId: connection.id,
      modelId: connection.models[0].id,
    })

    expect(imageActor.isImageGenerator).toBe(true)
  })

  test('isImageGenerator is false when Ollama model lacks image capability', async () => {
    const connection = await ConnectionModelFactory.withOptions({ modelCount: 1 }).create({
      type: 'Ollama',
    })

    // No need to set up mock or clear cache - it will return empty capabilities by default

    const textActor = await ActorModelFactory.create({
      connectionId: connection.id,
      modelId: connection.models[0].id,
    })

    const textActor2 = await ActorModelFactory.withOptions({
      connectionParams: { type: 'Ollama' },
    }).create()

    expect(textActor.isImageGenerator).toBe(false)
    expect(textActor2.isImageGenerator).toBe(false)

    expect(textActor.connection?.id).not.toBe(textActor2.connection?.id) // different connections
  })
})
