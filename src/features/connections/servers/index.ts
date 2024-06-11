import A1111ServerConnection from '~/features/connections/servers/A1111ServerConnection'
import LmsServerConnection from '~/features/connections/servers/LmsServerConnection'
import OllamaServerConnection from '~/features/connections/servers/OllamaServerConnection'
import OpenAiServerConnection from '~/features/connections/servers/OpenAiServerConnection'

export type ServerConnectionTypes =
  | LmsServerConnection
  | A1111ServerConnection
  | OllamaServerConnection
  | OpenAiServerConnection

export const serverConnectionByType = {
  LMS: LmsServerConnection,
  A1111: A1111ServerConnection,
  Ollama: OllamaServerConnection,
  OpenAi: OpenAiServerConnection,
}
