import { PropsWithChildren, useState } from 'react'
import {
  Popover,
  PopoverContent,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
  PopoverTrigger,
} from '@heroui/react'
import useMedia from 'use-media'
import ChatModelPopover from '~/components/chat/ChatModelPopover'
import { chatStore } from '~/core/chat/ChatStore'
import { observer } from 'mobx-react-lite'
import { twMerge } from 'tailwind-merge'
import FormInput from '~/components/form/FormInput'
import { actorStore } from '~/core/actor/ActorStore'
import CurrentGlobe from '~/icons/CurrentGlobe'

const currentUrl = 'https://google.com'

const KnowledgePopoverContent = observer(() => {
  const [sourceType, setSourceType] = useState<'url' | 'current_page'>('url')
  const [url, setUrl] = useState(currentUrl)

  const updateUrl = (nextUrl: string) => {
    setUrl(nextUrl)

    setSourceType(nextUrl === currentUrl ? 'current_page' : 'url')
  }

  // source?
  // chat with current page option (chrome only)
  // chat with url option (maybe we can do a cors check OR location check)
  // turn off option (clear?)
  // embedded model selector
  //

  // const sourceSelector

  return (
    <div className="relative h-full w-full overflow-y-scroll rounded-md text-base-content/60">
      <div className="mt-2 flex w-full flex-col gap-4">
        <FormInput
          value={url}
          onChange={e => updateUrl(e.target.value)}
          label="Url"
          endContent={
            <button
              onClick={() => updateUrl(currentUrl)}
              className={twMerge(
                'h-full place-content-center',
                sourceType === 'current_page' ? 'text-primary/80' : 'hover:text-base-content/80',
              )}
              title="Use current page"
            >
              <CurrentGlobe />
            </button>
          }
        />

        <div>
          <label>Embedding model</label>
          <div className="-mt-2 ml-2">
            <ChatModelPopover
              chat={chatStore.selectedChat!}
              actor={actorStore.knowledgeActor}
              label="Choose embedding model"
            />
          </div>
        </div>
      </div>
    </div>
  )
})

const KnowledgePopoverForm = observer(({ children }: PropsWithChildren) => {
  const isMobile = useMedia('(max-width: 768px)')
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()

  if (isMobile) {
    return (
      <>
        <button onClick={() => onOpen()}>{children}</button>

        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="full" className="bg-base-200">
          <ModalContent className="!max-w-screen !w-screen">
            <ModalHeader className="flex flex-col gap-1 pb-0 pt-2 text-base-content/60">
              Knowledge stack settings
            </ModalHeader>

            <ModalBody className="overflow-scroll px-2 pt-0 text-lg">
              <KnowledgePopoverContent />
            </ModalBody>
          </ModalContent>
        </Modal>
      </>
    )
  }

  // source?
  // chat with current page option (chrome only)
  // chat with url option (maybe we can do a cors check OR location check)
  // turn off option (clear?)
  // embedded model selector
  //
  return (
    <Popover
      offset={10}
      placement="bottom"
      className="rounded-lg before:!bg-base-content/60 before:shadow-none"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <PopoverTrigger>{children}</PopoverTrigger>

      <PopoverContent className=" h-full max-h-96 w-screen max-w-md overflow-hidden rounded-lg rounded-md border-2 border-base-content/60 bg-base-200 p-2 pt-0">
        <div className="my-2 hidden text-lg text-base-content/80 md:block">
          Knowledge stack settings
        </div>

        <KnowledgePopoverContent />
      </PopoverContent>
    </Popover>
  )
})

export default KnowledgePopoverForm
