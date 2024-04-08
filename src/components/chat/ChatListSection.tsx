import {
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Tooltip,
} from '@chakra-ui/react'
import { observer } from 'mobx-react-lite'
import { getSnapshot } from 'mobx-state-tree'
import { useRef, Fragment } from 'react'
import _ from 'lodash'

import { AccordionSectionProps } from '~/containers/SideBar'

import DocumentArrowDown from '~/icons/DocumentArrowDown'
import DocumentArrowUp from '~/icons/DocumentArrowUp'
import Edit from '~/icons/Edit'

import { IChatModel } from '~/models/ChatModel'
import { chatStore } from '~/models/ChatStore'
import { personaStore } from '~/models/PersonaStore'
import { settingStore } from '~/models/SettingStore'

import { TransferHandler } from '~/utils/transfer/TransferHandler'
import { ChatStoreSnapshotHandler } from '~/utils/transfer/ChatStoreSnapshotHandler'

export const ChatListSection = observer(({ isOpen, onSectionClicked }: AccordionSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const exportAll = async () => {
    const data = JSON.stringify({
      chatStore: await ChatStoreSnapshotHandler.formatChatStoreToExport(),
      personaStore: getSnapshot(personaStore),
      settingStore: getSnapshot(settingStore),
    })

    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }))
    link.download = 'llm-x-data.json'
    link.click()
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
            <button
              className="btn join-item btn-neutral mb-2 gap-2 p-2"
              title="Import chat"
              onClick={() => fileInputRef.current?.click()}
            >
              <DocumentArrowUp />
            </button>
          </Tooltip>
        </div>
      ) : (
        <AccordionButton onClick={onSectionClicked} className="btn btn-neutral inline-flex w-full">
          See Chat List <AccordionIcon />
        </AccordionButton>
      )}

      <AccordionPanel flex={1} className=" flex flex-1 flex-col text-base-content">
        <div className="no-scrollbar flex h-full flex-1 flex-col gap-2 overflow-y-scroll rounded-md">
          {_.map(chatStore.dateLabelToChatPairs, ([dateLabel, chats]) => (
            <Fragment key={dateLabel}>
              <span
                className="-mb-1 pl-2 text-sm font-semibold text-base-content/30"
                key={dateLabel}
              >
                {dateLabel}
              </span>

              {chats.map(chat => (
                <button
                  className={
                    ' group flex w-full flex-row justify-between rounded-md p-2 text-left lg:dropdown-right ' +
                    (chat.id === chatStore.selectedChat?.id
                      ? ' btn-neutral btn-active cursor-default'
                      : ' btn-ghost cursor-pointer')
                  }
                  onClick={() => handleChatSelected(chat)}
                  key={chat.id}
                >
                  <span className="line-clamp-1 flex-1">{chat.name || 'new chat'}</span>
                </button>
              ))}
            </Fragment>
          ))}
        </div>

        <div className="mt-2 flex flex-col justify-center gap-2">
          <label className=" text-center">Import / Export</label>

          {/* hidden file input */}
          <input
            style={{ display: 'none' }}
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={e => TransferHandler.handleImport(e.target.files)}
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
      </AccordionPanel>
    </AccordionItem>
  )
})
