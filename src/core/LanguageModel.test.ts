import { describe, expect, test } from 'vitest'
import {
  A1111ModelFactory,
  GeminiModelFactory,
  OllamaModelFactory,
  OpenAiModelFactory,
} from '~/core/LanguageModel.factory'
import LanguageModel from '~/core/LanguageModel'

describe('LanguageModel', () => {
  test('should correctly format an ollama model', async () => {
    const ollamaModelResponse = await OllamaModelFactory.create()

    const ollamaModel = LanguageModel.fromIOllamaModel(ollamaModelResponse, 'ollama-connectionId')

    expect(ollamaModel.type).toBe('Ollama')
    expect(ollamaModel.id).toBe('ollama-connectionId:' + ollamaModelResponse.name)
    expect(ollamaModel.label).toBe(ollamaModelResponse.name)
    expect(ollamaModel.modelName).toBe(ollamaModelResponse.name)

    expect(ollamaModel).toMatchObject(ollamaModelResponse)
  })

  test('should correctly format an openai model', async () => {
    const openAiModelResponse = OpenAiModelFactory.build()

    const ollamaModel = LanguageModel.fromIOpenAiModel(openAiModelResponse, 'openai-connectionId')

    expect(ollamaModel.type).toBe('OpenAi')
    expect(ollamaModel.id).toBe('openai-connectionId:' + openAiModelResponse._id)
    expect(ollamaModel.label).toBe(openAiModelResponse._id)
    expect(ollamaModel.modelName).toBe(openAiModelResponse._id)

    expect(ollamaModel).toMatchObject(openAiModelResponse)
  })

  test('should correctly format an gemini model', async () => {
    const geminiModelResponse = GeminiModelFactory.build()

    const ollamaModel = LanguageModel.fromIGeminiModel(geminiModelResponse, 'gemini-connectionId')

    expect(ollamaModel.type).toBe('Gemini')
    expect(ollamaModel.id).toBe('gemini-connectionId:' + geminiModelResponse.name)
    expect(ollamaModel.label).toBe(geminiModelResponse.name)
    expect(ollamaModel.modelName).toBe(geminiModelResponse.name)

    expect(ollamaModel).toMatchObject(geminiModelResponse)
  })

  test('should correctly format an a1111 model', async () => {
    const a1111ModelResponse = A1111ModelFactory.build()

    const ollamaModel = LanguageModel.fromIA1111Model(a1111ModelResponse, 'a1111-connectionId')

    expect(ollamaModel.type).toBe('A1111')
    expect(ollamaModel.id).toBe('a1111-connectionId:' + a1111ModelResponse.modelName)
    expect(ollamaModel.label).toBe(a1111ModelResponse.title)
    expect(ollamaModel.modelName).toBe(a1111ModelResponse.modelName)

    expect(ollamaModel).toMatchObject(a1111ModelResponse)
  })
})
