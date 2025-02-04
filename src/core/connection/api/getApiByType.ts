import { ConnectionTypes } from '~/core/connection/ConnectionModel'
import BaseApi from '~/core/connection/api/BaseApi'

const _apiByConnectionViewModelType: Record<ConnectionTypes, Promise<{ baseApi: BaseApi }>> = {
  A1111: import('~/core/connection/api/A1111Api'),
  LMS: import('~/core/connection/api/OpenAiApi'),
  Ollama: import('~/core/connection/api/OllamaApi'),
  OpenAi: import('~/core/connection/api/OpenAiApi'),
  Gemini: import('~/core/connection/api/GeminiApi'),
}

export const getApiByType = async (type: ConnectionTypes) => {
  return (await _apiByConnectionViewModelType[type]).baseApi
}

//todo: regenerating a message that failed immediately (without creating a new variation) does not wipe out the error message
// also, it would be nice to manually remove the error message maybe
