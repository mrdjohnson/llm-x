import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router-dom'
import { type MouseEvent } from 'react'

import { NavButtonDiv } from '~/components/NavButton'

import SettingSection, { SettingSectionItem } from '~/containers/SettingSection'

import Edit from '~/icons/Edit'

import { ChatViewModel } from '~/core/chat/ChatViewModel'
import { chatTable } from '~/core/chat/ChatTable'
import { chatStore } from '~/core/chat/ChatStore'
import { settingTable } from '~/core/setting/SettingTable'

export const ChatPanel = observer(() => {
  const { selectedChat, chats } = chatStore
  const navigate = useNavigate()

  const chatToSectionItem = (chat: ChatViewModel): SettingSectionItem<ChatViewModel> => ({
    id: chat.id,
    label: chat.name,
    subLabels: [chat.source.messageIds.length + ' messages'],
    data: chat,
  })

  const itemFilter = (chat: ChatViewModel, filterText: string) => {
    return chat.name.toLowerCase().includes(filterText)
  }

  const handleChatSelected = async (chat: ChatViewModel) => {
    await chatStore.selectChat(chat)
  }

  const createChat = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    const chat = await chatTable.create({})

    await settingTable.put({ selectedChatId: chat.id })

    navigate('/chats/' + chat.id)
  }

  return (
    <SettingSection
      items={chats.map(chatToSectionItem)}
      filterProps={{
        helpText: 'Filter chats by name...',
        itemFilter,
        emptyLabel: 'No chats found',
      }}
      onItemSelected={chat => chat && handleChatSelected(chat)}
      renderActionRow={chat => (
        <NavButtonDiv
          to={'/chats/' + chat.id}
          className="btn btn-ghost btn-sm ml-auto justify-start px-2"
        >
          <Edit className="size-5" />
        </NavButtonDiv>
      )}
      selectedItemId={selectedChat?.id}
      addButtonProps={{
        label: 'Add New Chat',
        onClick: e => createChat(e),
        isDisabled: !!chatStore.emptyChat,
      }}
    />
  )
})

export default ChatPanel
