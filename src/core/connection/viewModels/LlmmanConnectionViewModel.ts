import { ConnectionModel } from '~/core/connection/ConnectionModel'
import { connectionTable } from '~/core/connection/ConnectionTable'
import OllamaConnectionViewModel from '~/core/connection/viewModels/OllamaConnectionViewModel'

// llmman (https://github.com/llmmanorg/llmman) serves the Ollama API on port 17434
const DefaultHost = 'http://localhost:17434'

class LlmmanConnectionViewModel extends OllamaConnectionViewModel {
  DefaultHost: string = DefaultHost

  type = 'Llmman' as const

  readonly hostLabel = 'llmman Host:'
  readonly enabledLabel = 'Text generation through llmman:'

  static toViewModel(connection: ConnectionModel, { autoFetch = true } = {}) {
    return new this(connection, { autoFetch })
  }

  static readonly getSnapshot = (): ConnectionModel =>
    connectionTable.parse({
      ...OllamaConnectionViewModel.getSnapshot(),
      label: 'llmman',
      type: 'Llmman',
      host: DefaultHost,
    })
}

export default LlmmanConnectionViewModel
