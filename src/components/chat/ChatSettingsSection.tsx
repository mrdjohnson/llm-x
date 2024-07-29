import { useEffect, useRef, useState } from 'react'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { Controller, useForm } from 'react-hook-form'
import { Select, SelectItem } from '@nextui-org/react'
import { SnapshotIn, getSnapshot } from 'mobx-state-tree'

import { chatStore } from '~/models/ChatStore'
import { actorStore } from '~/models/actor/ActorStore'
import { IChatModel } from '~/models/ChatModel'

import Check from '~/icons/Check'
import Delete from '~/icons/Delete'
import DocumentArrowDown from '~/icons/DocumentArrowDown'
import Back from '~/icons/Back'

import Tooltip from '~/components/Tooltip'
import FormInput from '~/components/form/FormInput'

import { ChatSnapshotHandler } from '~/utils/transfer/ChatSnapshotHandler'
import { IActorModel } from '../../models/actor/ActorModel'
import Edit from '../../icons/Edit'
import { settingStore } from '../../models/SettingStore'

type ChatFormDataType = SnapshotIn<IChatModel>

const pluralize = (text: string, count: number) => {
  return `${count} ${text}` + (count !== 1 ? 's' : '')
}

const ChatActorItem = ({ actor }: { actor: IActorModel }) => {
  let personaLabel = actor.personas[0]?.name

  if (actor.personas.length > 1) {
    personaLabel = pluralize('persona', actor.personas.length)
  }

  const handleActorEdit = () => {
    actorStore.setActorToEdit(actor)
    settingStore.openSettingsModal('actors')
  }

  return (
    <li className="group relative gap-1 rounded-md bg-base-content/10">
      <div className="flex w-full flex-col items-start gap-0 p-2 !text-base-content cursor-pointer" onClick={handleActorEdit}>
        <span className="line-clamp-1">{actor.name}</span>

        <div className="ml-2 flex flex-col text-sm text-base-content/60">
          {personaLabel}

          {/* {actor.connections[0] && (
            <span>{pluralize('connection', actor.personas.length)}</span>
          )} */}
        </div>

        {/* <button
          className="absolute bottom-0 right-2 top-0 z-20 w-fit opacity-0 transition-opacity duration-300 ease-in-out hover:!opacity-100 group-hover:opacity-30 text-primary"
          onClick={handleActorEdit}
        >
          <Edit />
        </button> */}
      </div>
    </li>
  )
}

export const ChatSettingsSection = observer(({ onBackClicked }: { onBackClicked: () => void }) => {
  const {
    handleSubmit,
    reset,
    control,
    formState: { isDirty, errors },
  } = useForm<ChatFormDataType>()

  const [isExportOpen, setIsExportOpen] = useState(false)

  const modalRef = useRef<HTMLDialogElement>(null)

  const selectedChat = chatStore.selectedChat
  const chat = chatStore.selectedChat!

  const onExportClose = () => {
    setIsExportOpen(false)
  }

  const openExportDialog = () => {
    setIsExportOpen(true)
  }

  const handleFormSubmit = handleSubmit(formData => {
    const { name } = formData

    chat.setName(name)

    reset(formData)
  })

  const exportChat = async (includeImages: boolean) => {
    const data = JSON.stringify(
      await ChatSnapshotHandler.formatChatToExport(chat, { includeImages }),
    )

    onExportClose()

    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }))
    link.download = `llm-x-chat-${_.snakeCase(chat.name).replace('_', '-')}.json`
    link.click()
  }

  useEffect(() => {
    reset(getSnapshot(chat))
  }, [chat])

  useEffect(() => {
    if (isExportOpen) {
      modalRef.current?.showModal()
    } else {
      modalRef.current?.close()
    }
  }, [isExportOpen])

  const validateName = (name?: string) => {
    if (!name || name.length < 2 || name.length > 30) return 'Name length must be 2-30 chars'

    return true
  }

  if (!selectedChat) return null

  return (
    <>
      <div className="flex min-h-[48px] flex-1 flex-col overflow-y-hidden">
        <div className="flex flex-row gap-2">
          <button className="btn btn-circle btn-ghost btn-sm" onClick={onBackClicked}>
            <Back />
          </button>

          <span className="flex-shrink-1 line-clamp-1 max-w-[85%] flex-1 text-left md:text-lg">
            {selectedChat?.name || 'new chat'}
          </span>
        </div>

        <div className=" mt-2 flex flex-1 flex-col text-base-content">
          <div className="no-scrollbar flex h-full flex-1 flex-col overflow-y-scroll rounded-md">
            <div className="flex flex-col gap-2 rounded-box bg-base-300 text-base-content">
              <form className="flex w-full flex-row gap-2" onSubmit={handleFormSubmit}>
                <Controller
                  render={({ field }) => (
                    <FormInput
                      id={chat.id + ''}
                      label="Name"
                      errorMessage={errors.name?.message}
                      endContent={
                        isDirty && (
                          <button
                            className="btn btn-ghost btn-sm px-2"
                            disabled={!!errors.name?.message}
                          >
                            <Check />
                          </button>
                        )
                      }
                      {...field}
                    />
                  )}
                  control={control}
                  name="name"
                  defaultValue={chat.name || 'new chat'}
                  rules={{
                    validate: validateName,
                  }}
                />
              </form>

              {/* {connection.} */}
              <ul className="-menu p-0">
                {chat.actors.map(actor => (
                  <ChatActorItem actor={actor} key={actor.id} />
                ))}
              </ul>

              {/* note, do not put select in a controller
              <Select
                selectionMode="multiple"
                size="sm"
                className="w-full min-w-[20ch] rounded-md bg-transparent"
                classNames={{
                  value: '!text-base-content min-w-[20ch]',
                  trigger:
                    '!bg-transparent rounded-md border border-base-content/30 hover:!bg-base-100',
                  popoverContent: 'text-base-content bg-base-100 rounded-md ',
                  listboxWrapper: 'max-h-[500px]',
                  description: 'text-base-content/45',
                }}
                label="Actors"
                description="More than one selected actor, or actors with multiple selections will result in multiple data calls"
                // hack to get select component to update
                selectedKeys={[...chat.actorIds]}
              >
                {actorStore.actors.map(actor => (
                  <SelectItem
                    key={actor.id}
                    textValue={actor.name}
                    className="flex w-full !min-w-[13ch] flex-row !text-base-content hover:!bg-base-content/10 focus:!bg-base-content/10"
                    onClick={() => chat.addOrRemoveActor(actor)}
                  >
                    <div>{actor.name}</div>

                    <div className="ml-2 flex flex-col text-sm text-base-content/60">
                      {actor.personas[0] && (
                        <div>
                          {actor.personas.length} {pluralize('persona', actor.personas.length)}
                        </div>
                      )}
                      {actor.connections[0] && (
                        <div>
                          {actor.connections.length}{' '}
                          {pluralize('connection', actor.personas.length)}
                        </div>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </Select> */}
            </div>
          </div>

          <div className="flex flex-row gap-2">
            <Tooltip label="Export Chat">
              <button
                onClick={openExportDialog}
                className="btn btn-ghost flex flex-1"
                title="Export Chat"
              >
                <DocumentArrowDown />
              </button>
            </Tooltip>

            <Tooltip label="Delete Chat">
              <button
                onClick={() => chatStore.deleteChat(chat)}
                className="btn btn-ghost text-error"
              >
                <Delete className="h-5 w-5" />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      <dialog className="modal modal-middle" ref={modalRef} onClose={onExportClose}>
        <div className="modal-box">
          <h3 className="mb-4 text-center text-lg font-bold">Export type:</h3>

          <div className="flex flex-row justify-between px-6">
            <div className="flex flex-col justify-center">
              <button className="btn btn-neutral" onClick={() => exportChat(true)}>
                With images
              </button>

              <span className="label-text text-center">(larger file size)</span>
            </div>

            <div className="flex flex-col justify-center">
              <button
                className="btn btn-neutral"
                onClick={() => {
                  exportChat(false)
                }}
              >
                Without images
              </button>

              <span className="label-text text-center">(smaller file size)</span>
            </div>
          </div>

          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">✕</button>
            </form>
          </div>
        </div>

        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  )
})
