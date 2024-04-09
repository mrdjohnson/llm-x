import { useEffect, useMemo, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Accordion } from '@chakra-ui/react'
import useMedia from 'use-media'

import { ChatSettingsSection } from '~/components/chat/ChatSettingsSection'
import { ChatListSection } from '~/components/chat/ChatListSection'

import { chatStore } from '~/models/ChatStore'
import { settingStore } from '~/models/SettingStore'

import MediaEject from '~/icons/MediaEject'

export type AccordionSectionProps = {
  isOpen: boolean
  onSectionClicked: () => void
}

export const SideBar = observer(() => {
  const [openIndex, setOpenIndex] = useState(1)

  const isMobile = useMedia('(max-width: 1024px)')

  const { isSidebarOpen } = settingStore

  const width = useMemo(() => {
    if (isMobile) {
      return 'w-full'
    }

    return 'transition-[width] duration-300 ease-in-out ' + (isSidebarOpen ? ' w-[260px]' : ' w-0')
  }, [isMobile, isSidebarOpen])

  const handleSectionClicked = () => {
    // clicking on self or other will open other
    setOpenIndex((openIndex + 1) % 2)
  }

  useEffect(() => {
    setOpenIndex(0)
  }, [chatStore.selectedChat])

  return (
    <div className={'group/sidebar relative h-full ' + width}>
      <Accordion
        className={
          'flex h-full flex-1 flex-col flex-nowrap gap-2 self-stretch rounded-md bg-base-300 p-2 transition-opacity duration-300 ease-in-out' +
          (settingStore.isSidebarOpen || isMobile ? ' opacity-100' : ' opacity-0')
        }
        onChange={(index: number) => setOpenIndex(index)}
        index={openIndex}
      >
        <ChatSettingsSection isOpen={openIndex === 0} onSectionClicked={handleSectionClicked} />

        <ChatListSection isOpen={openIndex === 1} onSectionClicked={handleSectionClicked} />
      </Accordion>

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
