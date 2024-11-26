import { chatStore } from '~/core/chat/ChatStore'
import { observer } from 'mobx-react-lite'
import { Controller, useForm } from 'react-hook-form'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import Drawer from '~/containers/Drawer'
import FormInput from '~/components/form/FormInput'

import Check from '~/icons/Check'
import Delete from '~/icons/Delete'

import { ChatModel } from '~/core/chat/ChatModel'
import { chatTable } from '~/core/chat/ChatTable'

export const ChatForm = observer(() => {
  const navigate = useNavigate()

  const chat = chatStore.selectedChat!
  const chatModel = chat.source

  const {
    handleSubmit,
    reset,
    control,
    formState: { isDirty, errors },
  } = useForm<ChatModel>()

  const handleFormSubmit = handleSubmit(async formData => {
    await chatTable.put(formData)

    reset(formData)
  })

  const handleDelete = async () => {
    navigate('/chats')

    await chatStore.destroyChat(chat)
  }

  const validateName = (name: string) => {
    if (name.length < 2 || name.length > 30) return 'Name length must be 2-30 chars'

    return true
  }

  useEffect(() => {
    reset(chat.source)
  }, [chat])

  return (
    <Drawer label={chat.name}>
      <form onSubmit={handleFormSubmit} className="flex h-full flex-col gap-2 p-2">
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
                    onClick={handleFormSubmit}
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
          defaultValue={chatModel.name || 'new chat'}
          rules={{
            validate: validateName,
          }}
        />

        <div className="mt-auto flex flex-row gap-2 pt-2">
          <button
            className="btn mr-auto border-0 !bg-transparent text-error/60 md:btn-sm hover:text-error"
            onClick={handleDelete}
          >
            <Delete />
          </button>

          <button
            className="btn border-0 !bg-transparent text-base-content/60 transition duration-300 ease-in-out md:btn-sm hover:text-base-content"
            disabled={!isDirty}
            onClick={() => reset()}
          >
            Reset
          </button>
          <button
            className="btn btn-primary transition duration-300 ease-in-out md:btn-sm"
            disabled={!isDirty || !errors}
          >
            Save
          </button>
        </div>
      </form>
    </Drawer>
  )
})
