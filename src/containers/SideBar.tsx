import { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Accordion } from '@chakra-ui/react'

import { ChatSettingsSection } from '../components/chat/ChatSettingsSection'
import { ChatListSection } from '../components/chat/ChatListSection'

import { chatStore } from '../models/ChatStore'

export type AccordionSectionProps = {
  isOpen: boolean
  onSectionClicked: () => void
}

export const SideBar = observer(() => {
  const [openIndex, setOpenIndex] = useState(1)

  const handleSectionClicked = () => {
    // clicking on self or other will open other
    setOpenIndex((openIndex + 1) % 2)
  }

  useEffect(() => {
    setOpenIndex(0)
  }, [chatStore.selectedChat])

  return (
    <Accordion
      className="flex h-auto w-[260px] min-w-[260px] flex-1 flex-col flex-nowrap gap-2 rounded-md bg-base-300 p-2 lg:h-full "
      onChange={(index: number) => setOpenIndex(index)}
      index={openIndex}
    >
      <ChatSettingsSection isOpen={openIndex === 0} onSectionClicked={handleSectionClicked} />

      <ChatListSection isOpen={openIndex === 1} onSectionClicked={handleSectionClicked} />
    </Accordion>
  )
})
