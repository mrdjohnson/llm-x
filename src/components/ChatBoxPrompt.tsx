import { PropsWithChildren } from 'react'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'

import { chatStore } from '~/models/ChatStore'
import { settingStore } from '~/models/SettingStore'
import { personaStore } from '~/models/PersonaStore'

import AttachmentWrapper from '~/components/AttachmentWrapper'
import FunTitle from '~/components/FunTitle'
import ToolTip from '~/components/Tooltip'

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
      <span className="text-left">{children}</span>
    </li>
  )
}

const ChatBoxPrompt = observer(() => {
  return (
    <div className="hero my-auto">
      <div className="hero-content w-fit text-center">
        <div>
          <h1 className="text-2xl font-bold md:text-4xl">
            {'Getting started with '}

            <FunTitle className="text-2xl font-bold md:text-4xl" />
          </h1>

          <div className="text-2xl">
            <ul className="steps steps-vertical list-inside list-disc py-6 text-left *:text-lg [&_a]:text-lg [&_span]:text-lg">
              <Step isCompleted={settingStore.isServerConnected || settingStore.isLmsServerConnected}>
                {'Tell LM Studio or Ollama that '}
                <span className="text-primary">we're cool:</span>
                <button
                  className="link decoration-primary"
                  onClick={() => settingStore.openSettingsModal('connection')}
                >
                  How to connect
                </button>
              </Step>

              <Step type="primary" isCompleted={settingStore.isA1111ServerConnected}>
                {'Befriend AUTOMATIC1111 for '}
                <span className="font-semibold text-primary">image generation:</span>
                <button
                  className="link decoration-primary"
                  onClick={() => settingStore.openSettingsModal('connection')}
                >
                  How to connect
                </button>
              </Step>

              <Step isCompleted={!_.isEmpty([...settingStore.ollamaModels, ...settingStore.lmsModels])}>
                {'Download a model from LM Studio home page or '}
                <a
                  href="https://ollama.com/library"
                  className="link decoration-primary"
                  target="__blank"
                  title="Open Ollama Library in new tab"
                >
                  Ollama Library
                </a>
              </Step>

              <Step type="secondary" isCompleted={!_.isEmpty(personaStore.personas)}>
                {'Create and Select a'}

                <ToolTip label="aka System prompt: How the bot should respond" placement="top">
                  <button
                    className="link ml-1 decoration-secondary"
                    onClick={() => settingStore.openSettingsModal('personas')}
                  >
                    Persona
                  </button>
                </ToolTip>

                {'to give your bot some pizzaz'}
              </Step>

              <Step type="secondary">
                {'Drag and Drop or'}

                <AttachmentWrapper accept=".json">
                  <span className="link decoration-secondary">Import a chat or save</span>
                </AttachmentWrapper>

                {'from a previous session'}
              </Step>

              <Step type="secondary" isCompleted={!!chatStore.selectedChat?.previewImageUrls[0]}>
                {'Drag and Drop, Paste, or'}

                <AttachmentWrapper>
                  <span className="link decoration-secondary">
                    Attach as many images as you want
                  </span>
                </AttachmentWrapper>

                {'for use with multimodal models'}
              </Step>

              <Step inCompleteIcon="★">
                <span>
                  <span className="font-semibold text-primary">Send</span> a prompt!
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
