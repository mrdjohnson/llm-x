import { chatStore } from '~/core/chat/ChatStore'
import { Controller, useForm } from 'react-hook-form'
import { useEffect, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import Drawer from '~/containers/Drawer'
import SettingSection, { SettingSectionItem } from '~/containers/SettingSection'

import FormInput from '~/components/form/FormInput'

import Check from '~/icons/Check'
import Delete from '~/icons/Delete'

import { ChatModel } from '~/core/chat/ChatModel'
import { chatTable } from '~/core/chat/ChatTable'
import { ChatViewModel } from '~/core/chat/ChatViewModel'
import { actorStore } from '~/core/actor/ActorStore'
import { ActorViewModel } from '~/core/actor/ActorViewModel'

const ChatActorSection = ({ chat }: { chat: ChatViewModel }) => {
  const actors = chat.actors
  const navigate = useNavigate()

  const actorToSectionItem = (actor: ActorViewModel): SettingSectionItem<ActorViewModel> => {
    const modelName = actor.modelLabel || 'Inactive model:' + actor.connection?.id
    const subLabels = []
    let label

    if (actor.connection) {
      subLabels.push(actor.connection.label + (actor.isUsingDefaults ? ' (default)' : ''))
    }

    if (actor.source.name) {
      label = actor.source.name
      subLabels.push(modelName)
    } else {
      label = modelName
    }

    return {
      id: actor.id,
      to: 'actor/' + actor.id,
      label,
      subLabels,
      data: actor,
    }
  }

  const itemFilter = (actor: ActorViewModel, filterText: string) => {
    return (
      actor.modelName?.toLowerCase().includes(filterText) ||
      actor.source.name?.toLowerCase().includes(filterText)
    )
  }

  const createActor = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    const actor = await chat.createActor({ name: 'New Actor' })

    navigate('actor/' + actor.id)
  }

  const actorToActionRow = (actor: ActorViewModel) => {
    return (
      <button
        className="btn btn-ghost btn-sm ml-auto justify-start px-2 text-error"
        onClick={() => actorStore.destroyActor(actor)}
      >
        <Delete />
      </button>
    )
  }

  return (
    <SettingSection
      items={actors.map(actorToSectionItem)}
      filterProps={{
        helpText: 'Filter actor models by name or model name...',
        itemFilter,
        emptyLabel: 'No actors found',
      }}
      addButtonProps={{
        label: 'Add New Actor',
        onClick: e => createActor(e),
      }}
      onItemSelected={actor => navigate('actor/' + actor!.id)}
      renderActionRow={actorToActionRow}
      hasLargeItems
      isSubSection
    />
  )
}

export const ChatForm = () => {
  const navigate = useNavigate()

  const chat = chatStore.selectedChat!
  const chatModel = chat.source

  const methods = useForm<ChatModel>()

  const {
    handleSubmit,
    reset,
    control,
    formState: { isDirty, errors },
  } = methods

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
    <Drawer label={chat.name} outletContent={methods}>
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

        <ChatActorSection chat={chat} />

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
}
