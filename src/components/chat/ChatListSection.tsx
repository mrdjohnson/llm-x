import { observer } from 'mobx-react-lite'
import { Fragment } from 'react'
import _ from 'lodash'

import AttachmentWrapper from '~/components/AttachmentWrapper'
import Tooltip from '~/components/Tooltip'

import DocumentArrowUp from '~/icons/DocumentArrowUp'
import Edit from '~/icons/Edit'

import { IChatModel } from '~/models/ChatModel'
import { chatStore } from '~/models/ChatStore'

export const ChatListSection = observer(({ onChatSelected }: { onChatSelected: () => void }) => {
  const handleChatSelected = (chat: IChatModel) => {
    chatStore.selectChat(chat)

    onChatSelected()
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-y-hidden">
      <div className="join join-horizontal flex w-full">
        <button
          className="btn join-item btn-neutral mb-2 flex flex-1 flex-row items-center justify-center gap-2 p-2"
          onClick={chatStore.createChat}
          disabled={!!chatStore.emptyChat}
        >
          New Chat
          <Edit className="h-5 w-5" />
        </button>

        <AttachmentWrapper accept=".json">
          <Tooltip label="Import chat" className="px-2 font-normal text-base-content">
            <button className="btn join-item btn-neutral mb-2 gap-2 p-2">
              <DocumentArrowUp />
            </button>
          </Tooltip>
        </AttachmentWrapper>
      </div>

      <div className=" flex w-full flex-1 flex-col overflow-y-scroll text-base-content">
        <div className="no-scrollbar relative flex h-full w-full flex-1 flex-col gap-2 overflow-y-auto overflow-x-clip rounded-md">
          {_.map(chatStore.dateLabelToChatPairs, ([dateLabel, chats]) => (
            <Fragment key={dateLabel}>
              <span
                className="sticky top-0 bg-base-300 text-sm font-semibold text-base-content/30"
                key={dateLabel}
              >
                {dateLabel}
              </span>

              {chats.map(chat => (
                <button
                  className={
                    ' group flex w-full max-w-full cursor-pointer flex-row justify-between rounded-md p-2 text-left lg:dropdown-right ' +
                    (chat.id === chatStore.selectedChat?.id
                      ? ' btn-neutral btn-active '
                      : ' btn-ghost ')
                  }
                  onClick={() => handleChatSelected(chat)}
                  key={chat.id}
                >
                  <span className="line-clamp-1 flex-1 text-ellipsis">
                    {chat.name || 'new chat'}
                  </span>
                </button>
              ))}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  )
})
