import { PropsWithChildren, useEffect, useMemo, useState } from 'react'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'

import AttachmentWrapper from '~/components/AttachmentWrapper'
import FunTitle from '~/components/FunTitle'
import { NavButtonDiv } from '~/components/NavButton'

import { ChatViewModel } from '~/core/chat/ChatViewModel'
import { personaTable } from '~/core/persona/PersonaTable'
import { connectionStore } from '~/core/connection/ConnectionStore'

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

const ChatBoxPrompt = observer(({ chat }: { chat: ChatViewModel }) => {
  const [hasCreatedPersonas, setHasCreatedPersonas] = useState(false)

  const connections = connectionStore.connections

  const activeConnectionTypes = useMemo(() => {
    const connectionsTypes = _.chain(connections).filter('isConnected').map('type').value()

    return new Set(connectionsTypes)
  }, [connections])

  const anyConnectionHasModels = useMemo(() => {
    for (const connection of connections) {
      if (!_.isEmpty(connection.models)) {
        return true
      }
    }
    return false
  }, [connections])

  useEffect(() => {
    if (personaTable.cache.length > 0) {
      setHasCreatedPersonas(true)
      return
    }

    personaTable.length().then(length => {
      if (length > 0) {
        setHasCreatedPersonas(true)
      }
    })
  }, [])

  return (
    <div className="hero my-auto">
      <div className="hero-content w-fit text-center">
        <div>
          <h1 className="text-2xl font-bold md:text-4xl">
            {'Getting started with '}

            <FunTitle className="text-2xl font-bold md:text-4xl" />
          </h1>

          <div className="text-2xl">
            <ul className="steps steps-vertical list-inside list-disc gap-3 py-6 text-left *:!text-lg [&_a]:text-lg [&_span]:text-lg">
              <Step isCompleted={!_.isEmpty(activeConnectionTypes)}>
                {'Tell LM Studio, Ollama, AUTOMATIC1111, or Open AI that '}
                <span className="text-primary">we're cool:</span>
                <NavButtonDiv
                  to="/connection"
                  className="link inline-block text-lg decoration-primary"
                >
                  How to connect
                </NavButtonDiv>
              </Step>

              <Step isCompleted={anyConnectionHasModels}>
                {'Download a model from '}
                <a
                  href="https://huggingface.co/lmstudio-community"
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

              <Step type="secondary" isCompleted={hasCreatedPersonas}>
                {'Create and Select a'}

                <NavButtonDiv
                  to="/personas"
                  className="link ml-1 inline-block decoration-secondary"
                >
                  Persona <span className="text-xs">(aka System Prompt)</span>
                </NavButtonDiv>

                {'to give your bot some pizzaz'}
              </Step>

              <Step type="secondary">
                {'Drag and Drop or'}

                <AttachmentWrapper accept=".json">
                  <span className="link decoration-secondary">Import a chat or save</span>
                </AttachmentWrapper>

                {'from a previous session'}
              </Step>

              <Step type="secondary" isCompleted={!_.isEmpty(chat?.previewImages)}>
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
