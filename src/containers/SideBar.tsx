import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { applySnapshot, getSnapshot } from 'mobx-state-tree'

import { chatStore } from '../models/ChatStore'
import { IChatModel } from '../models/ChatModel'
import { settingStore } from '../models/SettingStore'
import { personaStore } from '../models/PersonaStore'

import Delete from '../icons/Delete'
import Options from '../icons/Options'
import Edit from '../icons/Edit'
import Check from '../icons/Check'
import DocumentArrowUp from '../icons/DocumentArrowUp'
import DocumentArrowDown from '../icons/DocumentArrowDown'

const ChatItem = observer(({ chat }: { chat: IChatModel }) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const name = inputRef.current?.value

    chat.setName(name)
  }

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = chat.name
    }
  }, [chat.name])

  return (
    <div
      className={
        ' group dropdown dropdown-left flex w-full flex-row justify-between rounded-md p-2 text-left lg:dropdown-right ' +
        (chat.id === chatStore.selectedChat?.id
          ? ' btn-neutral btn-active cursor-default'
          : ' btn-ghost cursor-pointer')
      }
      onClick={() => chatStore.selectChat(chat)}
    >
      <span className="line-clamp-1 flex-1">{chat.name || 'new chat'}</span>

      <div onClick={e => e.stopPropagation()}>
        <div tabIndex={0} role="button" className="h-full px-1 hover:text-base-content/40">
          <Options />
        </div>

        <div
          tabIndex={0}
          className="menu dropdown-content z-10 mr-3 mt-2 flex w-72 gap-2 rounded-box bg-base-300 p-2 shadow lg:ml-3"
        >
          <form className="flex flex-row gap-2" onSubmit={handleFormSubmit}>
            <input
              type="text"
              className="input input-bordered w-full min-w-24 flex-1 grow focus:outline-none"
              defaultValue={chat.name || 'new chat'}
              ref={inputRef}
            />

            <button className="btn btn-neutral">
              <Check />
            </button>
          </form>

          <button onClick={() => chatStore.deleteChat(chat)} className="btn btn-ghost text-error">
            <Delete />
          </button>
        </div>
      </div>
    </div>
  )
})

export const SideBar = observer(() => {
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const importAll = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    // reset file input
    event.target.value = ''

    const data = JSON.parse(await file.text())

    applySnapshot(chatStore, data.chatStore)
    applySnapshot(personaStore, data.personaStore)
    applySnapshot(settingStore, data.settingStore)
  }

  return (
    <div className="flex h-auto w-[260px] min-w-[260px] flex-1 flex-col flex-nowrap gap-2 rounded-md bg-base-300 p-2 lg:h-full ">
      <div className="flex h-full flex-1 flex-col">
        <button
          className="btn btn-neutral mb-2 flex w-full flex-row items-center justify-center gap-2 p-2"
          onClick={chatStore.createChat}
          disabled={chatStore.hasEmptyChat}
        >
          New Chat
          <Edit className="h-5 w-5" />
        </button>

        {chats.map(chat => (
          <ChatItem chat={chat} key={chat.id} />
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
          onChange={importAll}
        />

        <div className="flex flex-row justify-center gap-2">
          <button
            className="btn btn-ghost btn-active"
            title="Import All"
            onClick={() => fileInputRef.current?.click()}
          >
            <DocumentArrowUp />
          </button>

          <button className="btn btn-ghost btn-active" title="Export All" onClick={exportAll}>
            <DocumentArrowDown />
          </button>
        </div>
      </div>
    </div>
  )
})
