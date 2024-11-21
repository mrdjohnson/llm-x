import { useEffect, useMemo, useState } from 'react'
import { observer } from 'mobx-react-lite'
import useMedia from 'use-media'
import { twMerge } from 'tailwind-merge'

import Navbar from '~/components/Navbar'
import { ChatSettingsSection } from '~/components/chat/ChatSettingsSection'
import { ChatListSection } from '~/components/chat/ChatListSection'

import { settingStore } from '~/core/setting/SettingStore'

import MediaEject from '~/icons/MediaEject'
import { Divider } from '@nextui-org/react'

export type AccordionSectionProps = {
  isOpen: boolean
  onSectionClicked: () => void
}

export const SideBar = observer(() => {
  const [openSectionType, setOpenSectionType] = useState<'chatList' | 'chat'>('chatList')

  const isMobile = useMedia('(max-width: 768px)')

  const setting = settingStore.setting

  const isSidebarOpen = setting.isSidebarOpen

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
  }, [setting.selectedChatId])

  if (!setting) return <div />

  return (
    <nav className={twMerge('group/sidebar relative h-full', width)}>
      <div
        className={twMerge(
          'flex h-full flex-1 flex-col flex-nowrap gap-2 self-stretch bg-base-300 p-2 transition-opacity duration-300 ease-in-out',
          isSidebarOpen || isMobile ? ' opacity-100' : ' pointer-events-none -z-10 opacity-0',
        )}
      >
        <div className="hidden md:block">
          <Navbar />
        </div>

        <Divider className="bg-base-content/15" />

        {openSectionType === 'chat' && setting.selectedChatId ? (
          <ChatSettingsSection onBackClicked={goToChatList} />
        ) : (
          <ChatListSection onChatSelected={goToChat} />
        )}
      </div>

      {/* hide sidebar button */}
      <button
        className={twMerge(
          'group absolute -right-8 top-[45%] z-20 opacity-30 transition-all duration-300 ease-in-out hover:opacity-100 group-hover/sidebar:opacity-100',
          isSidebarOpen && '-right-4',
        )}
        onClick={() => settingStore.update({ isSidebarOpen: !isSidebarOpen })}
      >
        <MediaEject className={twMerge('h-8 w-8 rotate-90', isSidebarOpen && '-rotate-90')} />
      </button>
    </nav>
  )
})
