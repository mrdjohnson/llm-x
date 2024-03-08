import _ from 'lodash'
import { observer } from 'mobx-react-lite'

import { settingStore } from '../models/SettingStore'
import { personaStore } from '../models/PersonaStore'

const ChatBoxPrompt = observer(() => {
  const noServer = !settingStore.isServerConnected

  return (
    <div className="hero my-auto">
      <div className="hero-content w-fit text-center">
        <div>
          <h1 className="text-4xl font-bold">
            Getting started with LLM <span className="text-4xl text-primary">X</span>
          </h1>

          <div className="text-2xl">
            <ul className="list-inside list-disc py-6 text-left *:text-lg [&_a]:text-lg [&_span]:text-lg">
              {noServer && (
                <li>
                  Tell Ollama that <span className="text-primary">we're cool</span>: Learn more
                  <span
                    className="link  decoration-primary"
                    onClick={() => settingStore.openUpdateModal({ fromUser: true })}
                  >
                    here
                  </span>
                </li>
              )}

              {_.isEmpty(settingStore.models) && (
                <li>
                  Download a model from ollama:
                  <a
                    href="https://ollama.com/library"
                    className="link decoration-primary"
                    target="__blank"
                    title="Open Ollama Library in new tab"
                  >
                    Ollama Library
                  </a>
                </li>
              )}

              <li className="text-2xl">
                <span className="text-primary">Import</span> a chat from a previous session
              </li>

              <li>
                Drag and Drop (or attach) an <span className="text-primary">image</span> for use
                with multimodal models
              </li>

              <li>
                {_.isEmpty(personaStore.personas) && 'Create and '} Select a
                <span className="ml-1 text-primary">persona</span> to give your bot some pizzaz
              </li>

              <li>
                <span className="text-primary">Send</span> a prompt!
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
})

export default ChatBoxPrompt
