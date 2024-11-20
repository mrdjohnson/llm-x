const ORIGIN =
  __TARGET__ === 'chrome'
    ? 'chrome-extension://iodcdhcpahifeligoegcmcdibdkffclk'
    : 'https://mrdjohnson.github.io'

const OLLAMA_CODE = `OLLAMA_ORIGINS=${ORIGIN} ollama serve`
const POWERSHELL_OLLAMA_CODE = `$env:OLLAMA_ORIGINS="${ORIGIN}"; ollama serve`

export const OllamaHelpMarkdown = `

### How to connect to [Ollama](https://ollama.com/) Server:

By default, Ollama only allows requests from local host. To use custom origins (like this one), you need to change _OLLAMA_ORIGINS_

1. Option 1:

   1. Follow the instructions in the faq: [Ollama
    FAQ](https://github.com/ollama/ollama/blob/main/docs/faq.md#how-do-i-configure-ollama-server) and set the _OLLAMA_ORIGINS_ to be _https://mrdjohnson.github.io_
    (this tells ollama that mrdjohnson github projects, like this one,
    are OK to listen to).

   1. You are now set up to run  _ollama serve_ normally, or you can start the application normally

1. Option 2:

   - When starting ollama: \`${OLLAMA_CODE}\`
   - Powershell version: \`${POWERSHELL_OLLAMA_CODE}\`

Find out more about Ollama on their website: [https://ollama.com/](https://ollama.com/)
`
