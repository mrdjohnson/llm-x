import A1111ServerConnection from '~/core/connections/servers/A1111ServerConnection'
import LmsServerConnection from '~/core/connections/servers/LmsServerConnection'
import OllamaServerConnection from '~/core/connections/servers/OllamaServerConnection'
import OpenAiServerConnection from '~/core/connections/servers/OpenAiServerConnection'

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
