import { Button, Combobox, Group, Modal, Popover, ScrollArea, useCombobox } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { twMerge } from 'tailwind-merge'
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
import _ from 'lodash'

type ChatModelPopoverProps = {
  chat: ChatViewModel
  actor?: ActorViewModel
}

const ChatModelPopoverContent = ({
  chat,
  actor,
  onClose,
}: ChatModelPopoverProps & { onClose: () => void }) => {
  const combobox = useCombobox()

  const [filterText, setFilterText] = useState('')

  const createActor = async (connectionId?: string | null, modelId?: string | null) => {
    if (actor) {
      await actor.update({ connectionId, modelId })
    } else {
      await chat.createActor({ connectionId, modelId })
    }

    onClose()
  }

  return (
    <>
      <FormInput
        placeholder="Filter models by name..."
        variant="underlined"
        leftSection={
          <button
            onClick={onClose}
            className="hidden text-base-content/30 hover:text-base-content/60 md:block"
          >
            <Back />
          </button>
        }
        rightSection={
          <button
            className="hidden pr-1 text-base-content/30 hover:text-base-content/60 disabled:hidden md:block"
            disabled={_.isEmpty(filterText)}
            onClick={() => setFilterText('')}
          >
            ✕
          </button>
        }
        value={filterText}
        onChange={e => setFilterText(e.target.value)}
        autoFocus
      />

      <ScrollArea className="!max-h-full">
        <Combobox store={combobox}>
          <Combobox.Options className="relative max-h-full w-full overflow-scroll">
            {actorStore.systemActor && (
              <Combobox.Option
                key="system_model"
                value="System current model"
                onClick={() => createActor(null, null)}
                active={!actor?.isUsingDefaults}
              >
                {actorStore.systemActor.label}
              </Combobox.Option>
            )}

            {connectionStore.getFilteredModelGroups(filterText).map(({ connection, models }) => (
              <Combobox.Group key={connection.id} label={connection.label}>
                {models.map(model => (
                  <Combobox.Option
                    key={model.id}
                    value={model.modelName}
                    onClick={() => createActor(connection.id, model.id)}
                    active={model.id === actor?.model?.id && !actor.isUsingDefaults}
                  >
                    {model.label}
                  </Combobox.Option>
                ))}
              </Combobox.Group>
            ))}
          </Combobox.Options>
        </Combobox>
      </ScrollArea>

      {actor && (
        <div
          className="group flex w-full flex-row border-t border-base-content/30 p-2 transition-all duration-300 ease-in-out"
          role="button"
        >
          <span className="line-clamp-1 w-full cursor-default place-content-baseline justify-between break-all align-baseline text-base-content opacity-40">
            {actor.modelLabel}
          </span>

          <button
            className="place-content-center pl-2 text-error opacity-30 hover:!opacity-65"
            onClick={() => actorStore.destroyActor(actor)}
            title="Remove model from chat"
          >
            <Delete className="h-6 w-6 md:w-4" />
          </button>
        </div>
      )}
    </>
  )
}

const ChatModelPopover = ({ chat, actor }: ChatModelPopoverProps) => {
  const [opened, { open, close }] = useDisclosure()
  const isMobile = useMedia('(max-width: 768px)')

  const handleDelete = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    actorStore.destroyActor(actor!)
  }

  const trigger = actor ? (
    <Group className="group w-full !justify-between gap-2" role="button" onClick={open}>
      <div className="flex flex-col">
        <span
          className={twMerge(
            'link mx-0 line-clamp-1 w-full place-content-baseline justify-between break-all align-baseline text-lg opacity-45 transition-all duration-300 ease-in-out group-hover:opacity-65 md:text-base',
            !actor.isConnected && 'opacity-20',
          )}
        >
          {actor.label}
        </span>

        {connectionStore.activeConnections.length > 1 && (
          <span className="text-sm opacity-30">{actor.connection?.label}</span>
        )}
      </div>

      <span
        className="place-content-center text-error opacity-0 transition-all duration-300 ease-in-out hover:!opacity-100 group-hover:opacity-50"
        onClick={handleDelete}
      >
        <Delete />
      </span>
    </Group>
  ) : (
    <Button
      onClick={open}
      variant="subtle"
      color="gray"
      rightSection={
        <ChevronDown className="place-self-center !stroke-[2px] text-base-content/45" />
      }
    >
      Add a Model
    </Button>
  )

  if (isMobile) {
    return (
      <>
        {trigger}

        <Modal
          opened={opened}
          onClose={close}
          title="Add a Model"
          fullScreen
          classNames={{
            body: '!max-h-fit overflow-hidden flex flex-col !h-full',
            content: '!flex flex-col h-full max-h-full',
          }}
        >
          <ChatModelPopoverContent chat={chat} onClose={close} actor={actor} />
        </Modal>
      </>
    )
  }

  return (
    <Popover
      position="right-start"
      opened={opened}
      onChange={nextOpen => (nextOpen ? open() : close())}
      withArrow
      arrowSize={15}
    >
      <Popover.Target>{trigger}</Popover.Target>

      <Popover.Dropdown className="flex !max-h-96 !w-screen max-w-md flex-col">
        <ChatModelPopoverContent chat={chat} onClose={close} actor={actor} />
      </Popover.Dropdown>
    </Popover>
  )
}

export default ChatModelPopover
