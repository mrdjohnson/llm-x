import { observer } from 'mobx-react-lite'

import CopyButton from '~/components/CopyButton'

const OLLAMA_CODE = 'OLLAMA_ORIGINS=https://mrdjohnson.github.io ollama serve'
const POWERSHELL_OLLAMA_CODE = '$env:OLLAMA_ORIGINS="https://mrdjohnson.github.io"; ollama serve'
const A1111_CODE = './webui.sh --api --listen --cors-allow-origins "*"'
const LMS_CODE = 'lms server start --cors=true'

const HelpPanel = observer(() => {
  return (
    <div className="w-full pl-2">
      <h3 className="-ml-2 mt-5 pb-3 text-lg font-bold">
        How to connect to
        <a href="https://lmstudio.ai/" target="__blank" className="link text-lg">
          LM Studio
        </a>
        :
      </h3>

      <p>LM Studio makes working with models easy! Use this and get going:</p>

      <div className="my-4 flex flex-row place-content-center gap-2">
        <div className="prose">
          <code>{LMS_CODE}</code>
        </div>

        <CopyButton className="btn swap btn-sm my-auto" text={LMS_CODE} />
      </div>

      <div className="divider" />

      <h3 className="-ml-2 pb-3 text-lg font-bold">How to connect to Ollama Server:</h3>

      <div className="flex flex-col gap-2">
        <p>
          By default, Ollama only allows requests from local host. To use custom origins (like this
          one), you need to change
          <span className="prose mx-1">
            <code>OLLAMA_ORIGINS</code>
          </span>
        </p>
        <p>
          <p>Option 1:</p>

          <p className="ml-2">
            1: Follow the instructions in the faq:
            <a
              href="https://github.com/ollama/ollama/blob/main/docs/faq.md#how-do-i-configure-ollama-server"
              className=" link self-center"
            >
              Ollama FAQ
            </a>
            <span>and set the</span>
            <span className="prose mx-1">
              <code>OLLAMA_ORIGINS</code>
            </span>
            <span>to be</span>
            <span className="prose mx-1">
              <code>https://mrdjohnson.github.io</code>
            </span>
            (this tells ollama that mrdjohnson github projects, like this one, are OK to listen to).
            <p>
              2: You are now set up to run{' '}
              <span className="prose mx-1">
                <code>ollama serve</code>
              </span>
              normally, or you can start the application normally
            </p>
          </p>
        </p>
      </div>

      <p className="my-2">
        Option 2:
        <p className="ml-2">
          <div className="my-2 flex flex-row place-content-center gap-2">
            <div className="prose">
              When starting ollama: <code>{OLLAMA_CODE}</code>
            </div>
            <CopyButton className="btn swap btn-sm my-auto" text={OLLAMA_CODE} />
          </div>
          <div className="my-2 flex flex-row place-content-center gap-2">
            <div className="prose">
              Powershell version: <code>{POWERSHELL_OLLAMA_CODE}</code>
            </div>

            <CopyButton className="btn swap btn-sm my-auto" text={POWERSHELL_OLLAMA_CODE} />
          </div>
        </p>
      </p>

      <div>
        Find out more about Ollama on their website:
        <a href="https://ollama.com/" className=" link self-center">
          https://ollama.com/
        </a>
      </div>

      <div className="divider" />

      <h3 className="-ml-2 mt-5 pb-3 text-lg font-bold">
        How to connect to
        <a
          href="https://github.com/AUTOMATIC1111/stable-diffusion-webui?tab=readme-ov-file#stable-diffusion-web-ui"
          target="__blank"
          className="link"
        >
          AUTOMATIC1111
        </a>
        for image generation:
      </h3>

      <p>Ideally you just need to clone the project, and run this code in the folder:</p>
      <div className="my-4 flex flex-row place-content-center gap-2">
        <div className="prose">
          <code>{A1111_CODE}</code>
        </div>

        <CopyButton className="btn swap btn-sm my-auto" text={A1111_CODE} />
      </div>
    </div>
  )
})

export default HelpPanel
