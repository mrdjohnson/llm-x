import { useEffect, useRef, useState } from 'react'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { useForm } from 'react-hook-form'

import { chatStore } from '~/models/ChatStore'

import Check from '~/icons/Check'
import Delete from '~/icons/Delete'
import DocumentArrowDown from '~/icons/DocumentArrowDown'
import Back from '~/icons/Back'

import Tooltip from '~/components/Tooltip'

import { ChatSnapshotHandler } from '~/utils/transfer/ChatSnapshotHandler'

export const ChatSettingsSection = observer(({ onBackClicked }: { onBackClicked: () => void }) => {
  const {
    register,
    setValue,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<{ name: string }>({})

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

    reset()
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
    setValue('name', chat.name, { shouldDirty: false })

    reset()
  }, [chat.name])

  useEffect(() => {
    if (isExportOpen) {
      modalRef.current?.showModal()
    } else {
      modalRef.current?.close()
    }
  }, [isExportOpen])

  if (!selectedChat) return null

  return (
    <>
      <div className="flex min-h-[48px] flex-1 flex-col overflow-y-hidden">
        <div className="flex flex-row gap-2">
          <button className="btn btn-circle btn-ghost btn-sm" onClick={onBackClicked}>
            <Back />
          </button>

          <span className="flex-shrink-1 line-clamp-1 max-w-[85%] flex-1 text-center md:text-lg">
            {selectedChat?.name || 'new chat'}
          </span>
        </div>

        <div className=" mt-2 flex flex-1 flex-col text-base-content">
          <div className="no-scrollbar flex h-full flex-1 flex-col overflow-y-scroll rounded-md">
            <div className="flex flex-col gap-2 rounded-box bg-base-300 text-base-content">
              <form className="flex w-full flex-row gap-2" onSubmit={handleFormSubmit}>
                <div className="form-control w-full">
                  <div className="label pb-1 pt-0">
                    <span className="label-text text-sm">Name:</span>
                  </div>

                  <div className="flex flex-row items-center gap-2">
                    <input
                      type="text"
                      id="name"
                      className="input input-bordered w-full flex-1 focus:outline-none"
                      defaultValue={chat.name || 'new chat'}
                      minLength={2}
                      maxLength={30}
                      {...register('name', { required: true, minLength: 2, maxLength: 30 })}
                    />

                    {isDirty && (
                      <button className="btn btn-neutral">
                        <Check />
                      </button>
                    )}
                  </div>
                </div>
              </form>
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
