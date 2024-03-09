import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { applySnapshot, getSnapshot } from 'mobx-state-tree'
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react'
import _ from 'lodash'
import { useForm } from 'react-hook-form'

import { chatStore } from '../models/ChatStore'
import { settingStore } from '../models/SettingStore'
import { personaStore } from '../models/PersonaStore'
import { IChatModel } from '../models/ChatModel'

import Delete from '../icons/Delete'
import Edit from '../icons/Edit'
import Check from '../icons/Check'
import DocumentArrowUp from '../icons/DocumentArrowUp'
import DocumentArrowDown from '../icons/DocumentArrowDown'

type AccordionSectionProps = {
  isOpen: boolean
  onSectionClicked: () => void
}

const ChatSettingsSection = observer(({ isOpen, onSectionClicked }: AccordionSectionProps) => {
  const {
    register,
    setValue,
    handleSubmit,
    reset,
    formState: { isValid, isDirty },
  } = useForm<{ name: string }>({})

  const selectedChat = chatStore.selectedChat
  const chat = chatStore.selectedChat!

  const handleFormSubmit = handleSubmit(formData => {
    const { name } = formData

    chat.setName(name)

    reset()
  })

  const exportChat = () => {
    const data = JSON.stringify(getSnapshot(chat))

    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }))
    link.download = `llm-x-chat-${_.snakeCase(chat.name).replace('_', '-')}.json`
    link.click()
  }

  useEffect(() => {
    setValue('name', chat.name, { shouldDirty: false })

    reset()
  }, [chat.name])

  if (!selectedChat) return null

  return (
    <AccordionItem
      className={
        isOpen
          ? 'flex min-h-[48px] flex-1 flex-col overflow-y-hidden [&>.chakra-collapse]:!flex [&>.chakra-collapse]:!flex-1'
          : ''
      }
    >
      <AccordionButton className="w-full self-start" onClick={onSectionClicked}>
        <button
          className={'btn max-w-full flex-1 flex-nowrap px-2' + (isOpen ? ' btn-neutral' : '')}
        >
          <span className="flex-shrink-1 line-clamp-1 max-w-[85%]">{selectedChat?.name}</span>
          <AccordionIcon className="-flex-1" />
        </button>
      </AccordionButton>

      <AccordionPanel flex={1} className=" mt-2 flex flex-1 flex-col text-base-content">
        <div className="no-scrollbar flex h-full flex-1 flex-col overflow-y-scroll rounded-md">
          <div className="flex flex-col gap-2 rounded-box bg-base-300 text-base-content">
            <form className="flex w-full flex-row gap-2" onSubmit={handleFormSubmit}>
              <div className="form-control w-full">
                <div className="label pb-1 pt-0">
                  <span className="label-text text-sm">Name:</span>
                </div>

                <div className="flex flex-row items-center gap-2">
                  <input
                    type="text"
                    id="name"
                    className="input input-bordered w-full flex-1 focus:outline-none"
                    defaultValue={chat.name || 'new chat'}
                    minLength={2}
                    maxLength={30}
                    {...register('name', { required: true, minLength: 2, maxLength: 30 })}
                  />

                  {isDirty && (
                    <button className="btn btn-neutral">
                      <Check />
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="flex flex-row gap-2">
          <button
            onClick={exportChat}
            className="btn btn-ghost tooltip tooltip-top z-10 flex flex-1"
            title="Export Chat"
            data-tip="Export Chat"
          >
            <DocumentArrowDown />
          </button>

          <button onClick={() => chatStore.deleteChat(chat)} className="btn btn-ghost text-error">
            <Delete />
          </button>
        </div>
      </AccordionPanel>
    </AccordionItem>
  )
})

const ChatListSection = observer(({ isOpen, onSectionClicked }: AccordionSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const importTypeRef = useRef<'all' | 'chat'>('all')

  const chats = chatStore.chats

  const exportAll = () => {
    const data = JSON.stringify({
      chatStore: getSnapshot(chatStore),
      personaStore: getSnapshot(personaStore),
      settingStore: getSnapshot(settingStore),
    })

    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }))
    link.download = 'llm-x-data.json'
    link.click()
  }

  const handleImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    // reset file input
    event.target.value = ''

    if (importTypeRef.current === 'all') {
      importAll(file)
    } else {
      importChat(file)
    }
  }

  const importAll = async (file: File) => {
    const data = JSON.parse(await file.text())

    applySnapshot(chatStore, data.chatStore)
    applySnapshot(personaStore, data.personaStore)
    applySnapshot(settingStore, data.settingStore)
  }

  const importChat = async (file: File) => {
    const data = JSON.parse(await file.text())

    chatStore.importChat(data)
  }

  const handleImportClicked = (importType: 'all' | 'chat') => {
    importTypeRef.current = importType

    fileInputRef.current?.click()
  }

  const handleChatSelected = (chat: IChatModel) => {
    chatStore.selectChat(chat)

    onSectionClicked()
  }

  return (
    <AccordionItem
      className={
        isOpen
          ? 'flex flex-1 flex-col overflow-y-hidden [&>.chakra-collapse]:!flex [&>.chakra-collapse]:!flex-1'
          : ''
      }
    >
      <AccordionButton onClick={onSectionClicked}>
        <div className={'join join-horizontal w-full' + (isOpen ? ' flex' : ' hidden')}>
          <button
            className="btn join-item btn-neutral mb-2 flex flex-1 flex-row items-center justify-center gap-2 p-2"
            onClick={chatStore.createChat}
            disabled={chatStore.hasEmptyChat}
          >
            New Chat
            <Edit className="h-5 w-5" />
          </button>

          <button
            className="btn join-item btn-neutral tooltip tooltip-bottom mb-2 gap-2 p-2"
            title="Import chat"
            onClick={() => handleImportClicked('chat')}
            data-tip="Import chat"
          >
            <DocumentArrowUp />
          </button>
        </div>

        <button className={'btn btn-neutral w-full' + (isOpen ? ' hidden' : ' inline-flex')}>
          Chat List <AccordionIcon />
        </button>
      </AccordionButton>

      <AccordionPanel flex={1} className=" flex flex-1 flex-col text-base-content">
        <div className="no-scrollbar flex h-full flex-1 flex-col overflow-y-scroll rounded-md">
          {chats.map(chat => (
            <div
              className={
                ' group flex w-full flex-row justify-between rounded-md p-2 text-left lg:dropdown-right ' +
                (chat.id === chatStore.selectedChat?.id
                  ? ' btn-neutral btn-active cursor-default'
                  : ' btn-ghost cursor-pointer')
              }
              onClick={() => handleChatSelected(chat)}
            >
              <span className="line-clamp-1 flex-1">{chat.name || 'new chat'}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col justify-center gap-2">
          <label className=" text-center">Import / Export</label>

          {/* hidden file input */}
          <input
            style={{ display: 'none' }}
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
          />

          <div className="flex flex-row justify-center gap-2">
            <button
              className="btn btn-ghost btn-active"
              title="Import All"
              onClick={() => handleImportClicked('all')}
            >
              <DocumentArrowUp />
            </button>

            <button className="btn btn-ghost btn-active" title="Export All" onClick={exportAll}>
              <DocumentArrowDown />
            </button>
          </div>
        </div>
      </AccordionPanel>
    </AccordionItem>
  )
})

export const SideBar = observer(() => {
  const [openIndex, setOpenIndex] = useState(1)

  const handleSectionClicked = () => {
    // clicking on self or other will open other
    setOpenIndex((openIndex + 1) % 2)
  }

  return (
    <Accordion
      className="flex h-auto w-[260px] min-w-[260px] flex-1 flex-col flex-nowrap gap-2 rounded-md bg-base-300 p-2 lg:h-full "
      onChange={(index: number) => setOpenIndex(index)}
      index={openIndex}
    >
      <ChatSettingsSection isOpen={openIndex === 0} onSectionClicked={handleSectionClicked} />

      <ChatListSection isOpen={openIndex === 1} onSectionClicked={handleSectionClicked} />
    </Accordion>
  )
})
