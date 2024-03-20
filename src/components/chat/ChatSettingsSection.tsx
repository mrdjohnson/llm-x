import { useEffect } from 'react'
import { AccordionItem, AccordionButton, AccordionIcon, AccordionPanel } from '@chakra-ui/react'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { getSnapshot } from 'mobx-state-tree'
import { useForm } from 'react-hook-form'

import { AccordionSectionProps } from '../../containers/SideBar'
import { chatStore } from '../../models/ChatStore'

import Check from '../../icons/Check'
import Delete from '../../icons/Delete'
import DocumentArrowDown from '../../icons/DocumentArrowDown'
import Tooltip from '../Tooltip'

export const ChatSettingsSection = observer(
  ({ isOpen, onSectionClicked }: AccordionSectionProps) => {
    const {
      register,
      setValue,
      handleSubmit,
      reset,
      formState: { isDirty },
    } = useForm<{ name: string }>({})

    const selectedChat = chatStore.selectedChat
    const chat = chatStore.selectedChat!

    const handleFormSubmit = handleSubmit(formData => {
      const { name } = formData

      chat.setName(name)

      reset()
    })

    const exportChat = () => {
      const data = JSON.stringify(getSnapshot(chat))

      const link = document.createElement('a')
      link.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }))
      link.download = `llm-x-chat-${_.snakeCase(chat.name).replace('_', '-')}.json`
      link.click()
    }

    useEffect(() => {
      setValue('name', chat.name, { shouldDirty: false })

      reset()
    }, [chat.name])

    if (!selectedChat) return null

    return (
      <AccordionItem
        className={
          isOpen
            ? 'flex min-h-[48px] flex-1 flex-col overflow-y-hidden [&>.chakra-collapse]:!flex [&>.chakra-collapse]:!flex-1'
            : ''
        }
      >
        <AccordionButton className="w-full self-start" onClick={onSectionClicked}>
          <button
            className={'btn max-w-full flex-1 flex-nowrap px-2' + (isOpen ? ' btn-neutral' : '')}
          >
            <span className="flex-shrink-1 line-clamp-1 max-w-[85%]">
              {selectedChat?.name || 'new chat'}
            </span>
            <AccordionIcon className="-flex-1" />
          </button>
        </AccordionButton>

        <AccordionPanel flex={1} className=" mt-2 flex flex-1 flex-col text-base-content">
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
                onClick={exportChat}
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
        </AccordionPanel>
      </AccordionItem>
    )
  },
)
