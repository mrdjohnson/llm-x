import {
  Popover,
  PopoverTrigger,
  Input,
  PopoverContent,
  Listbox,
  ListboxSection,
  ListboxItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from '@nextui-org/react'
import { twMerge } from 'tailwind-merge'
import { observer } from 'mobx-react-lite'
import useMedia from 'use-media'
import { useState, type MouseEvent } from 'react'

import FormInput from '~/components/form/FormInput'

import Back from '~/icons/Back'
import ChevronDown from '~/icons/ChevronDown'
import Delete from '~/icons/Delete'

import { ChatViewModel } from '~/core/chat/ChatViewModel'
import { connectionStore } from '~/core/connection/ConnectionStore'
import { actorStore } from '~/core/actor/ActorStore'
import { ActorViewModel } from '~/core/actor/ActorViewModel'

type ChatModelPopoverProps = {
  chat: ChatViewModel
  actor?: ActorViewModel
}

const ChatModelPopoverContent = observer(
  ({ chat, actor, onClose }: ChatModelPopoverProps & { onClose: () => void }) => {
    const [filterText, setFilterText] = useState('')

    const createActor = async (connectionId: string, modelId: string) => {
      if (actor) {
        await actor.update({ connectionId, modelId })
      } else {
        await chat.createActor({ connectionId, modelId })
      }

      onClose()
    }

    const currentModelOptions = !connectionStore.selectedModel
      ? []
      : [
          <ListboxItem
            key="any"
            textValue="System current model"
            onClick={() =>
              createActor(connectionStore.selectedConnection!.id, connectionStore.selectedModel!.id)
            }
            className="my-1 line-clamp-1 p-4 text-lg text-base-content/60 md:p-2 md:!text-lg"
            classNames={{
              title: 'text-lg md:text-sm line-clamp-1',
            }}
          >
            Use current model: {connectionStore.selectedModelLabel}
          </ListboxItem>,
        ]

    return (
      <>
        <FormInput
          placeholder="Filter models by name..."
          variant="underlined"
          startContent={
            <button
              onClick={onClose}
              className="hidden text-base-content/30 hover:text-base-content/60 md:block"
            >
              <Back />
            </button>
          }
          endContent={
            <button className="hidden pr-1 text-base-content/30 hover:text-base-content/60 md:block">
              ✕
            </button>
          }
          size="sm"
          className="w-full pt-2"
          value={filterText}
          onChange={e => setFilterText(e.target.value)}
          autoFocus
        />

        <Listbox className="w-full overflow-scroll p-0">
          {/* Listbox wants a list, add default items to the list and then spread the sections */}
          {[
            ...currentModelOptions,

            ...connectionStore.getFilteredModelGroups(filterText).map(({ connection, models }) => (
              <ListboxSection
                title={connection.label}
                classNames={{
                  heading:
                    'flex w-full sticky top-0 z-20 p-2 bg-base-200 border-b border-base-content/30 text-lg md:!text-sm',
                }}
              >
                {models.map(model => (
                  <ListboxItem
                    key={model.id}
                    textValue={model.modelName}
                    onClick={() => createActor(connection.id, model.id)}
                    className="my-1 line-clamp-1 p-4 text-lg text-base-content/60 hover:!bg-base-100 md:p-2 md:!text-lg"
                    classNames={{
                      title: 'text-lg md:text-sm line-clamp-1',
                    }}
                  >
                    {model.label}
                  </ListboxItem>
                ))}
              </ListboxSection>
            )),
          ]}
        </Listbox>

        {actor && (
          <div
            className="group flex w-full flex-row border-t border-base-content/30 p-2 transition-all duration-300 ease-in-out"
            role="button"
          >
            <span className="line-clamp-1 w-full place-content-baseline justify-between break-all align-baseline opacity-40 ">
              {actor.label}
            </span>

            <button
              className="place-content-center pl-2 text-error opacity-30 hover:!opacity-65"
              onClick={() => actorStore.destroyActor(actor)}
            >
              <Delete className="h-6 w-6 md:w-4" />
            </button>
          </div>
        )}
      </>
    )
  },
)

const ChatModelPopover = observer(({ chat, actor }: ChatModelPopoverProps) => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()
  const isMobile = useMedia('(max-width: 768px)')

  const handleDelete = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    actorStore.destroyActor(actor!)
  }

  const trigger = actor ? (
    <div className="group my-2 flex flex-row gap-2" role="button" onClick={onOpen}>
      <span className="link mx-0 line-clamp-1 w-full place-content-baseline justify-between break-all align-baseline text-lg opacity-45 transition-all duration-300 ease-in-out hover:opacity-65 md:text-base">
        {actor.model?.label}
      </span>

      <span
        className="place-content-center text-error opacity-0 transition-all duration-300 ease-in-out hover:!opacity-100 group-hover:opacity-50"
        onClick={handleDelete}
      >
        <Delete />
      </span>
    </div>
  ) : (
    <button
      className="group w-full !cursor-pointer rounded-md border-1 border-base-content/20 !bg-transparent hover:!border-base-content/30 hover:bg-base-100"
      onClick={onOpen}
    >
      <Input
        isReadOnly
        label="Add a Model"
        variant="bordered"
        size="sm"
        className="pointer-events-none w-full !cursor-pointer bg-transparent "
        classNames={{
          inputWrapper: twMerge(
            'btn !cursor-pointer border-none p-2 pr-1 !min-h-0 h-fit group-hover:bg-base-300',
          ),
          input: '!cursor-pointer',
          label: '!cursor-pointer mr-2',
          innerWrapper: twMerge('!cursor-pointer h-fit'),
        }}
        endContent={
          <ChevronDown className="place-self-center !stroke-[2px]  text-base-content/45" />
        }
      />
    </button>
  )

  if (isMobile) {
    return (
      <>
        {trigger}

        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="full" className="bg-base-200">
          <ModalContent className="!max-w-screen !w-screen">
            <ModalHeader className="flex flex-col gap-1 pb-0 pt-2 text-base-content/60">
              Add a Model
            </ModalHeader>

            <ModalBody className="overflow-scroll px-2 pt-0 text-lg">
              <ChatModelPopoverContent chat={chat} onClose={onClose} actor={actor} />
            </ModalBody>
          </ModalContent>
        </Modal>
      </>
    )
  }

  return (
    <Popover
      placement="bottom"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      showArrow
      offset={10}
      triggerType="listbox"
      className="before:!bg-base-content/60 before:shadow-none"
    >
      <PopoverTrigger>{trigger}</PopoverTrigger>

      <PopoverContent className="max-h-96 w-screen max-w-md -overflow-hidden border-2 border-base-content/60 bg-base-200 p-1 pt-0">
        <ChatModelPopoverContent chat={chat} onClose={onClose} actor={actor} />
      </PopoverContent>
    </Popover>
  )
})

export default ChatModelPopover
