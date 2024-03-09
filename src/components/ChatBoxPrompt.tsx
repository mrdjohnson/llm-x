import { PropsWithChildren } from 'react'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'

import { settingStore } from '../models/SettingStore'
import { personaStore } from '../models/PersonaStore'

type StepProps = { isCompleted?: boolean; type?: 'primary' | 'secondary'; inCompleteIcon?: string }

const Step = ({
  isCompleted,
  type = 'primary',
  children,
  inCompleteIcon = '●',
}: PropsWithChildren<StepProps>) => {
  return (
    <li
      className={isCompleted ? `step step-${type}` : 'step'}
      data-content={isCompleted ? '✓' : inCompleteIcon}
    >
      <span>{children}</span>
    </li>
  )
}

const ChatBoxPrompt = observer(() => {
  return (
    <div className="hero my-auto">
      <div className="hero-content w-fit text-center">
        <div>
          <h1 className="text-4xl font-bold">
            Getting started with LLM <span className="text-4xl text-primary">X</span>
          </h1>

          <div className="text-2xl">
            <ul className="steps steps-vertical list-inside list-disc py-6 text-left *:text-lg [&_a]:text-lg [&_span]:text-lg">
              <Step isCompleted={settingStore.isServerConnected}>
                {'Tell Ollama that '}
                <span className="text-primary">we're cool</span>
                {': Learn more'}
                <button
                  className="link decoration-primary"
                  onClick={() => settingStore.openUpdateModal({ fromUser: true })}
                >
                  here
                </button>
              </Step>

              <Step isCompleted={!_.isEmpty(settingStore.models)}>
                {'Download a model from ollama:'}
                <a
                  href="https://ollama.com/library"
                  className="link decoration-primary"
                  target="__blank"
                  title="Open Ollama Library in new tab"
                >
                  Ollama Library
                </a>
              </Step>

              <Step type="secondary">
                <span>
                  <span className="text-secondary">Import</span> a chat from a previous session
                </span>
              </Step>

              <Step type="secondary">
                Drag and Drop (or attach) an <span className="text-secondary">image</span> for use
                with multimodal models
              </Step>

              <Step type="secondary">
                {_.isEmpty(personaStore.personas) && 'Create and '} Select a
                <span className="ml-1 text-secondary">persona</span> to give your bot some pizzaz
              </Step>

              <Step inCompleteIcon="★">
                <span>
                  <span className="text-primary">Send</span> a prompt!
                </span>
              </Step>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
})

export default ChatBoxPrompt
