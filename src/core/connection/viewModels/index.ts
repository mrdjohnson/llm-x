import A1111ConnectionViewModel from '~/core/connection/viewModels/A1111ConnectionViewModel'
import LmsConnectionViewModel from '~/core/connection/viewModels/LmsConnectionViewModel'
import OllamaConnectionViewModel from '~/core/connection/viewModels/OllamaConnectionViewModel'
import OpenAiConnectionViewModel from '~/core/connection/viewModels/OpenAiConnectionViewModel'

export type ConnectionViewModelTypes =
  | LmsConnectionViewModel
  | A1111ConnectionViewModel
  | OllamaConnectionViewModel
  | OpenAiConnectionViewModel

export const connectionViewModelByType = {
  A1111: () => A1111ConnectionViewModel,
  LMS: () => LmsConnectionViewModel,
  Ollama: () => OllamaConnectionViewModel,
  OpenAi: () => OpenAiConnectionViewModel,
}
