const LLMMAN_INSTALL_CODE =
  'curl -fsSL https://raw.githubusercontent.com/llmmanorg/llmman/main/install.sh | sh'
const LLMMAN_SERVE_CODE = 'llmman serve'
const LLMMAN_PULL_CODE = 'llmman pull gemma4'

export const LlmmanHelpMarkdown = `

### How to connect to [llmman](https://github.com/llmmanorg/llmman) :

llmman is a local model runner that serves the Ollama API (alongside OpenAI- and Anthropic-compatible ones) on port 17434. Models are pulled as OCI artifacts or straight from Hugging Face and served by llama.cpp, vllm or mlx-lm.

1. Install: \`${LLMMAN_INSTALL_CODE}\`

1. Start the server: \`${LLMMAN_SERVE_CODE}\`

1. Pull a model: \`${LLMMAN_PULL_CODE}\` (or use the app)

The default host is _http://localhost:17434_; change it with the _LLMMAN_HOST_ environment variable.

Find out more about llmman on their [github](https://github.com/llmmanorg/llmman)
`
