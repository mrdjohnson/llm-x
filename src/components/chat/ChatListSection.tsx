import {
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Tooltip,
} from '@chakra-ui/react'
import { observer } from 'mobx-react-lite'
import { Fragment } from 'react'
import _ from 'lodash'

import { AccordionSectionProps } from '~/containers/SideBar'
import AttachmentWrapper from '~/components/AttachmentWrapper'

import DocumentArrowUp from '~/icons/DocumentArrowUp'
import Edit from '~/icons/Edit'

import { IChatModel } from '~/models/ChatModel'
import { chatStore } from '~/models/ChatStore'

export const ChatListSection = observer(({ isOpen, onSectionClicked }: AccordionSectionProps) => {
  const handleChatSelected = (chat: IChatModel) => {
    chatStore.selectChat(chat)

    onSectionClicked()
  }

  return (
    <AccordionItem
      className={
        isOpen
          ? 'relative flex flex-1 flex-col overflow-y-hidden [&>.chakra-collapse]:!flex [&>.chakra-collapse]:!flex-1'
          : ''
      }
    >
      {isOpen ? (
        <div className="join join-horizontal flex w-full">
          <button
            className="btn join-item btn-neutral mb-2 flex flex-1 flex-row items-center justify-center gap-2 p-2"
            onClick={chatStore.createChat}
            disabled={!!chatStore.emptyChat}
          >
            New Chat
            <Edit className="h-5 w-5" />
          </button>

          <Tooltip label="Import chat" className="!bg-base-100 px-2 font-normal text-base-content">
            <AttachmentWrapper accept=".json">
              <button className="btn join-item btn-neutral mb-2 gap-2 p-2" title="Import chat">
                <DocumentArrowUp />
              </button>
            </AttachmentWrapper>
          </Tooltip>
        </div>
      ) : (
        <AccordionButton onClick={onSectionClicked} className="btn btn-neutral inline-flex w-full">
          See Chat List <AccordionIcon />
        </AccordionButton>
      )}

      <AccordionPanel flex={1} className=" flex w-full flex-1 flex-col text-base-content">
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
                    ' group flex w-full max-w-full flex-row justify-between rounded-md p-2 text-left lg:dropdown-right ' +
                    (chat.id === chatStore.selectedChat?.id
                      ? ' btn-neutral btn-active cursor-default'
                      : ' btn-ghost cursor-pointer')
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
      </AccordionPanel>
    </AccordionItem>
  )
})
