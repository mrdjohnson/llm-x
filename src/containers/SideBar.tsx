import { useEffect, useRef } from 'react'
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
  const chats = chatStore.chats

  return (
    <div className="flex h-full w-[260px] min-w-[260px] flex-1 flex-col flex-nowrap gap-2 rounded-md bg-base-300 p-2 ">
      <button
        className="btn btn-neutral mb-2 flex w-full flex-row items-center justify-center gap-2 p-2"
        onClick={chatStore.createChat}
        disabled={chatStore.hasEmptyChat}
      >
        New Chat
        <Edit className='h-5 w-5' />
      </button>

      {chats.map(chat => (
        <ChatItem chat={chat} key={chat.id} />
      ))}
    </div>
  )
})
