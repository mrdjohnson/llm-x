import { useRef, PropsWithChildren, useEffect, useState, KeyboardEvent } from 'react'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { Editable, EditablePreview, EditableTextarea } from '@chakra-ui/react'

import { chatStore } from '../models/ChatStore'
import { settingStore } from '../models/SettingStore'
import { personaStore } from '../models/PersonaStore'

import AttachImageWrapper from '../components/AttachImageWrapper'

import Paperclip from '../icons/Paperclip'
import ChevronDown from '../icons/ChevronDown'

const ChatBoxInputRow = observer(
  ({
    onSend,
    children,
  }: PropsWithChildren<{ onSend: (message: string, image?: string) => void }>) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const previewAreaRef = useRef<HTMLSpanElement>(null)

    const [messageContent, setMessageContent] = useState('')

    const chat = chatStore.selectedChat!
    const { previewImage, messageToEdit } = chat

    const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      sendMessage()
    }

    const sendMessage = () => {
      if (!textareaRef.current) return

      const userMessage = textareaRef.current.value || ''

      onSend(userMessage, previewImage)

      setMessageContent('')
      textareaRef.current.focus()

      chat.setPreviewImage(undefined)
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.shiftKey || !textareaRef.current) return

      if (e.key === 'Enter' && messageContent) {
        sendMessage()

        textareaRef.current.blur()

        e.preventDefault()
      }

      const { selectionStart, selectionEnd } = textareaRef.current

      // we either want the start, or the end to be the same
      if (selectionStart !== selectionEnd) return

      if (e.key === 'ArrowUp' && selectionStart === 0) {
        chat.findAndEditPreviousMessage()
      }

      if (e.key === 'ArrowDown' && selectionStart === messageContent.length) {
        chat.findAndEditNextMessage()
      }

      if (e.key === 'Escape') {
        chat.setMessageToEdit(undefined)

        e.preventDefault()
      }
    }

    const noServer = !settingStore.selectedModel
    const inputDisabled = chatStore.isGettingData || noServer

    useEffect(() => {
      if (!textareaRef.current) return

      setMessageContent(messageToEdit?.content || '')
    }, [messageToEdit])

    useEffect(() => {
      if (inputDisabled) {
        textareaRef.current?.blur()
      } else {
        previewAreaRef.current?.focus()
      }
    }, [inputDisabled, chat])

    // can revisit if this slows things down but its been fine so far
    const lineCount = messageContent.split('\n').length

    return (
      <div
        className={
          'no-scrollbar mt-2 h-fit w-full shrink-0 ' + (noServer && 'tooltip cursor-not-allowed')
        }
        data-tip={
          settingStore.isServerConnected ? 'No Models Available' : 'Server is not connected'
        }
      >
        <form
          className={
            'join join-vertical h-full min-h-fit w-full rounded-md border border-base-content/20 ' +
            (inputDisabled ? 'bg-base-200' : '')
          }
          onSubmit={onFormSubmit}
        >
          <div className="join-item relative p-2">
            <Editable
              placeholder="Enter Prompt"
              startWithEditView
              selectAllOnFocus={false}
              value={messageContent}
              className="min-h-8"
            >
              <EditablePreview className="w-full py-0 opacity-30" ref={previewAreaRef} />

              <EditableTextarea
                className="no-scrollbar my-0 max-h-[400px] w-full resize-none overflow-scroll py-0 focus:outline-none"
                placeholder="Enter Prompt"
                ref={textareaRef}
                disabled={inputDisabled}
                rows={lineCount}
                onKeyDown={handleKeyDown}
                onChange={e => setMessageContent(_.trimStart(e.target.value))}
                autoFocus
              />
            </Editable>

            {previewImage && (
              <div className="absolute bottom-full end-0 mb-2 w-fit">
                <div className="relative h-full w-fit">
                  <div
                    className="btn btn-xs absolute right-1 top-1 opacity-70"
                    onClick={() => chat.setPreviewImage(undefined)}
                  >
                    x
                  </div>

                  <img
                    src={previewImage}
                    className="m-auto max-h-24 max-w-24 place-self-end rounded-md object-scale-down object-right"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="join-item flex w-full flex-row justify-between gap-2 bg-base-200 align-middle">
            <button
              tabIndex={0}
              type="button"
              className="btn btn-active rounded-none rounded-bl-md"
              disabled={inputDisabled}
              onClick={() => personaStore.openSelectionModal()}
            >
              {personaStore.selectedPersona?.name || 'No personas selected'}
              <ChevronDown />
            </button>

            <div className="flex">
              <AttachImageWrapper>
                <button
                  className="btn btn-ghost rounded-none"
                  type="button"
                  disabled={inputDisabled}
                >
                  <Paperclip />
                </button>
              </AttachImageWrapper>

              {chat.isEditingMessage && (
                <button
                  className="btn btn-ghost rounded-none text-error/50 hover:text-error"
                  type="button"
                  disabled={noServer}
                  onClick={() => chat.setMessageToEdit(undefined)}
                >
                  Cancel
                </button>
              )}

              {children || (
                <button
                  className="btn btn-ghost rounded-none rounded-br-md bg-base-100"
                  disabled={noServer || _.isEmpty(messageContent)}
                >
                  Send
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    )
  },
)

export default ChatBoxInputRow
