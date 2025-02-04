import A1111ConnectionViewModel from '~/core/connection/viewModels/A1111ConnectionViewModel'
import LmsConnectionViewModel from '~/core/connection/viewModels/LmsConnectionViewModel'
import OllamaConnectionViewModel from '~/core/connection/viewModels/OllamaConnectionViewModel'
import OpenAiConnectionViewModel from '~/core/connection/viewModels/OpenAiConnectionViewModel'
import GeminiConnectionViewModel from '~/core/connection/viewModels/GeminiConnectionViewModel'

export type ConnectionViewModelTypes =
  | LmsConnectionViewModel
  | A1111ConnectionViewModel
  | OllamaConnectionViewModel
  | OpenAiConnectionViewModel
  | GeminiConnectionViewModel

export const connectionViewModelByType = {
  A1111: () => A1111ConnectionViewModel,
  Ollama: () => OllamaConnectionViewModel,
  OpenAi: () => OpenAiConnectionViewModel,
  Gemini: () => GeminiConnectionViewModel,
  LMS: () => LmsConnectionViewModel,
}

export const connectionModelLabelByType = {
  A1111: 'Automatic1111',
  Ollama: 'Ollama',
  OpenAi: 'Open AI',
  Gemini: 'Gemini nano',
  LMS: 'LM Studio (open ai)',
}
