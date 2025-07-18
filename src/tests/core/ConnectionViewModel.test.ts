import { describe, expect, test } from 'vitest'
import { server } from '~/tests/msw'
import { http, HttpResponse } from 'msw'
import _ from 'lodash'

import { ConnectionModelFactory } from '~/core/connection/ConnectionModel.factory'
import { LanguageModelFactory } from '~/core/LanguageModel.factory'

describe('ConnectionViewModel', () => {
  describe('OllamaConnectionViewModel', () => {
    test('is empty when nothing returns', async () => {
      const connectionModel = await ConnectionModelFactory.withOptions({ models: [] }).create({
        type: 'Ollama',
        host: 'http://ollama-host:4444',
      })

      const emptyModels = await connectionModel.fetchLmModels()

      expect(emptyModels.length).toBe(0)
      expect(connectionModel.isConnected).toBe(true)
    })

    test('has models when models are returned', async () => {
      const ollamaModels = LanguageModelFactory.ollama().buildList(3)

      const connectionModel = await ConnectionModelFactory.withOptions({
        models: ollamaModels,
      }).create({
        type: 'Ollama',
        host: 'http://ollama-host:4444',
      })

      const models = _.toArray(connectionModel.models)
      const modelNames = _.map(models, 'modelName')

      expect(models.length).toBe(3)

      // the model names should equal the modelNames
      expect(modelNames).toEqual(_.map(ollamaModels, 'name'))

      expect(_.map(models, 'id')).toEqual(modelNames.map(name => connectionModel.id + ':' + name))
      expect(connectionModel.isConnected).toBe(true)
    })

    test('fails to connect when it cannot get models', async () => {
      server.use(
        http.all('http://ollama-host:4444/api/tags', () => {
          return HttpResponse.error()
        }),
      )

      const connectionModel = await ConnectionModelFactory.create({
        type: 'Ollama',
        host: 'http://ollama-host:4444',
      })

      const emptyModels = await connectionModel.fetchLmModels()

      expect(emptyModels.length).toBe(0)
      expect(connectionModel.isConnected).toBe(false)
    })

    test('clears models after fetch fails', async () => {
      const connectionModel = await ConnectionModelFactory.withOptions({
        modelCount: 3,
      }).create({
        type: 'Ollama',
        host: 'http://ollama-host:4444',
      })

      let models = _.toArray(await connectionModel.fetchLmModels())

      expect(models.length).toBe(3)
      expect(connectionModel.isConnected).toBe(true)

      server.use(
        http.all('http://ollama-host:4444/api/tags', () => {
          return HttpResponse.error()
        }),
      )

      models = _.toArray(await connectionModel.fetchLmModels())

      expect(models.length).toBe(0)
      expect(connectionModel.isConnected).toBe(false)
    })
  })

  describe('OpenAiConnectionViewModel', () => {
    test('is empty when nothing returns', async () => {
      const connectionModel = await ConnectionModelFactory.withOptions({ models: [] }).create({
        type: 'OpenAi',
        host: 'http://openAi-host:4444/v1',
      })

      const emptyModels = await connectionModel.fetchLmModels()

      expect(emptyModels.length).toBe(0)
      expect(connectionModel.isConnected).toBe(true)
    })

    test('has models when models are returned', async () => {
      const openAiModels = LanguageModelFactory.openAi().buildList(3)

      const connectionModel = await ConnectionModelFactory.withOptions({
        models: openAiModels,
      }).create({
        type: 'OpenAi',
        host: 'http://openAi-host:4444/v1',
      })

      const models = _.toArray(await connectionModel.fetchLmModels())
      const modelNames = _.map(models, 'modelName')

      expect(models.length).toBe(3)

      // the model names should equal the modelNames
      expect(modelNames).toEqual(_.map(openAiModels, '_id'))

      expect(_.map(models, 'id')).toEqual(modelNames.map(name => connectionModel.id + ':' + name))
      expect(connectionModel.isConnected).toBe(true)
    })

    test('fails to connect when it cannot get models', async () => {
      server.use(
        http.all('http://openAi-host:4444/v1/models', () => {
          return HttpResponse.error()
        }),
      )

      const connectionModel = await ConnectionModelFactory.create({
        type: 'OpenAi',
        host: 'http://openAi-host:4444/v1',
      })

      const emptyModels = await connectionModel.fetchLmModels()

      expect(emptyModels.length).toBe(0)
      expect(connectionModel.isConnected).toBe(false)
    })

    test('clears models after fetch fails', async () => {
      const connectionModel = await ConnectionModelFactory.withOptions({
        modelCount: 3,
      }).create({
        type: 'OpenAi',
        host: 'http://openAi-host:4444/v1',
      })

      let models = _.toArray(await connectionModel.fetchLmModels())

      expect(models.length).toBe(3)
      expect(connectionModel.isConnected).toBe(true)

      server.use(
        http.all('http://openAi-host:4444/v1/models', () => {
          return HttpResponse.error()
        }),
      )

      models = _.toArray(await connectionModel.fetchLmModels())

      expect(models.length).toBe(0)
      expect(connectionModel.isConnected).toBe(false)
    })
  })
})
