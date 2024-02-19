import { useRef } from 'react'
import { observer } from 'mobx-react-lite'

import { chatStore } from '../models/ChatStore'
import { IChatModel } from '../models/ChatModel'

import Delete from '../icons/Delete'
import Options from '../icons/Options'
import Edit from '../icons/Edit'
import Check from '../icons/Check'

const ChatItem = observer(({ chat }: { chat: IChatModel }) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const name = inputRef.current?.value

    chat.setName(name)
  }

  return (
    <div
      className={
        ' cursor-pointer group rounded-md w-full flex flex-row justify-between dropdown dropdown-left lg:dropdown-right text-left p-2 ' +
        (chat.id === chatStore.selectedChat?.id
          ? ' btn-active btn-neutral cursor-default'
          : ' btn-ghost')
      }
      onClick={() => chatStore.selectChat(chat)}
    >
      <span className="flex-1 line-clamp-1">{chat.name || 'new chat'}</span>

      <div onClick={e => e.stopPropagation()}>
        <div tabIndex={0} role="button" className="hover:text-base-content/40 px-1 h-full">
          <Options />
        </div>

        <div
          tabIndex={0}
          className="dropdown-content z-10 menu p-2 shadow bg-base-300 rounded-box mr-3 lg:ml-3 mt-2 w-72 flex gap-2"
        >
          <form className="flex flex-row gap-2" onSubmit={handleFormSubmit}>
            <input
              type="text"
              className="input grow flex-1 input-bordered focus:outline-none w-full min-w-24"
              defaultValue={chat.name}
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
  const chats = chatStore.chats

  return (
    <div className="flex-1 flex flex-col flex-nowrap gap-2 bg-base-300 h-full rounded-md p-2 min-w-[260px] w-[260px] ">
      <button
        className="btn w-full p-2 flex flex-row gap-2 items-center justify-center btn-neutral"
        onClick={chatStore.createChat}
      >
        New Chat
        <Edit />
      </button>

      {chats.map(chat => (
        <ChatItem chat={chat} key={chat.id} />
      ))}
    </div>
  )
})
