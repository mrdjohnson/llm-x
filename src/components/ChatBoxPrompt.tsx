import { PropsWithChildren, useMemo } from 'react'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'

import { chatStore } from '~/core/ChatStore'
import { settingStore } from '~/core/SettingStore'
import { personaStore } from '~/core/PersonaStore'

import AttachmentWrapper from '~/components/AttachmentWrapper'
import FunTitle from '~/components/FunTitle'
import ToolTip from '~/components/Tooltip'
import { connectionModelStore } from '~/core/connections/ConnectionModelStore'

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
  const activeConnectionTypes = useMemo(() => {
    const connectionsTypes = _.chain(connectionModelStore.connections)
      .filter('isConnected')
      .map('type')
      .value()

    return new Set(connectionsTypes)
  }, [connectionModelStore.connections])

  const anyConnectionHasModels = useMemo(() => {
    for (const connection of connectionModelStore.connections) {
      if (!_.isEmpty(connection.models)) {
        return true
      }
    }
    return false
  }, [connectionModelStore.connections])
  return (
    <div className="hero my-auto">
      <div className="hero-content w-fit text-center">
        <div>
          <h1 className="text-2xl font-bold md:text-4xl">
            {'Getting started with '}

            <FunTitle className="text-2xl font-bold md:text-4xl" />
          </h1>

          <div className="text-2xl">
            <ul className="steps steps-vertical list-inside list-disc gap-3 py-6 text-left *:text-lg [&_a]:text-lg [&_span]:text-lg">
              <Step isCompleted={!_.isEmpty(activeConnectionTypes)}>
                {'Tell LM Studio, Ollama, AUTOMATIC1111, or Open AI that '}
                <span className="text-primary">we're cool:</span>
                <button
                  className="link decoration-primary"
                  onClick={() => settingStore.openSettingsModal('connection')}
                >
                  How to connect
                </button>
              </Step>

              <Step isCompleted={anyConnectionHasModels}>
                {'Download a model from '}
                <a
                  href="https://huggingface.co/lmstudio-ai"
                  className="link decoration-primary"
                  target="__blank"
                  title="Open LM Studio's hugging face account in new tab"
                >
                  LM Studio's Hugging face
                </a>
                {' or '}
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

                <button
                  className="link ml-1 decoration-secondary"
                  onClick={() => settingStore.openSettingsModal('personas')}
                >
                  Persona <span className="text-xs">(aka System Prompt)</span>
                </button>

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
