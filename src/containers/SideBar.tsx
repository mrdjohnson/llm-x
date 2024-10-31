import { useEffect, useMemo, useState } from 'react'
import { observer } from 'mobx-react-lite'
import useMedia from 'use-media'

import { ChatSettingsSection } from '~/components/chat/ChatSettingsSection'
import { ChatListSection } from '~/components/chat/ChatListSection'

import { chatStore } from '~/core/ChatStore'
import { settingStore } from '~/core/SettingStore'

import MediaEject from '~/icons/MediaEject'

export type AccordionSectionProps = {
  isOpen: boolean
  onSectionClicked: () => void
}

export const SideBar = observer(() => {
  const [openSectionType, setOpenSectionType] = useState<'chatList' | 'chat'>('chatList')

  const isMobile = useMedia('(max-width: 1024px)')

  const { isSidebarOpen } = settingStore

  const width = useMemo(() => {
    if (isMobile) {
      return 'w-full'
    }

    return 'transition-[width] duration-300 ease-in-out ' + (isSidebarOpen ? ' w-[260px]' : ' w-0')
  }, [isMobile, isSidebarOpen])

  const goToChat = () => {
    setOpenSectionType('chat')
  }

  const goToChatList = () => {
    setOpenSectionType('chatList')
  }

  useEffect(() => {
    goToChat()
  }, [chatStore.selectedChat])

  return (
    <div className={'group/sidebar relative h-full ' + width}>
      <div
        className={
          'flex h-full flex-1 flex-col flex-nowrap gap-2 self-stretch rounded-md bg-base-300 p-2 transition-opacity duration-300 ease-in-out' +
          (settingStore.isSidebarOpen || isMobile ? ' opacity-100' : ' opacity-0')
        }
      >
        {openSectionType === 'chat' ? (
          <ChatSettingsSection onBackClicked={goToChatList} />
        ) : (
          <ChatListSection onChatSelected={goToChat} />
        )}
      </div>

      {/* hide sidebar button */}
      <button
        className={
          'group absolute top-[45%] z-20 opacity-30 transition-all duration-300 ease-in-out hover:opacity-100 group-hover/sidebar:opacity-100' +
          (isSidebarOpen ? ' -right-4' : ' -right-8')
        }
        onClick={settingStore.toggleSidebar}
      >
        <MediaEject className={'h-8 ' + (isSidebarOpen ? '-rotate-90' : 'rotate-90')} />
      </button>
    </div>
  )
})
