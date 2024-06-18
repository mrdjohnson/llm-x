import { useMemo, useEffect } from 'react'
import { Input, ScrollShadow, Select, SelectItem } from '@nextui-org/react'
import _ from 'lodash'
import { SnapshotIn, getSnapshot } from 'mobx-state-tree'
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form'

import Copy from '~/icons/Copy'

import { IActorModel } from '~/models/actor/ActorModel'
import { actorStore } from '~/models/actor/ActorStore'
import { personaStore } from '~/models/PersonaStore'

import { connectionModelStore } from '~/features/connections/ConnectionModelStore'
import { serverConnectionByType } from '~/features/connections/servers'

type ActorFormDataType = SnapshotIn<IActorModel>

type FormProps = {
  actor: IActorModel
  handleFormSubmit?: () => void
}

const ActorForm = ({ actor }: FormProps) => {
  const methods = useFormContext<ActorFormDataType>()

  const {
    handleSubmit,
    control,
    reset,
    formState: { isDirty, errors, isValid },
  } = methods

  const handleFormSubmit = handleSubmit(formData => {
    console.log('submitting form')

    actorStore.updateActor(formData)

    reset(formData)
  })

  console.log('errors: ', isValid, isDirty, JSON.stringify(errors, null, 2))

  useEffect(() => {
    reset(getSnapshot(actor), { keepIsValid: true })
  }, [actor])

  return (
    <FormProvider {...methods}>
      <form className="contents" onSubmit={handleFormSubmit}>
        <div className="my-2 flex w-full flex-col gap-2 overflow-scroll">
          <Controller
            render={({ field }) => (
              <Input
                type="text"
                variant="bordered"
                size="sm"
                label="Actor name"
                placeholder={actor.name}
                isInvalid={!!errors.name?.message}
                errorMessage={errors.name?.message}
                classNames={{
                  label: '!text-base-content/45',
                  inputWrapper: '!bg-base-transparent border-base-content/30 border',
                }}
                {...field}
              />
            )}
            control={control}
            name="name"
            defaultValue={actor.name}
            rules={{
              required: true,
              validate: name => {
                return name.length >= 2 ? true : 'Name needs to be at least length 2'
              },
            }}
          />

          <Controller
            render={({ field }) => (
              <Input
                type="text"
                variant="bordered"
                size="sm"
                label="Description"
                placeholder={actor.description}
                classNames={{
                  label: '!text-base-content/45',
                  inputWrapper: '!bg-base-transparent border-base-content/30 border',
                }}
                {...field}
              />
            )}
            control={control}
            name="description"
            defaultValue={actor.description}
          />

          <PersonaSelect />

          <ConnectionSelect />
        </div>

        {/* submit button */}
        <button />
      </form>
    </FormProvider>
  )
}

const PersonaSelect = () => {
  const { control } = useFormContext<ActorFormDataType>()

  return (
    <Controller
      render={({ field }) => (
        <Select
          selectionMode="multiple"
          size="sm"
          className="w-full min-w-[20ch] rounded-md bg-transparent hover:!bg-base-200"
          classNames={{
            value: '!text-base-content min-w-[20ch]',
            trigger: 'bg-transparent rounded-md border border-base-content/30 hover:!bg-base-100',
            popoverContent: 'text-base-content bg-base-100 rounded-md',
            description: 'text-base-content/45',
          }}
          onSelectionChange={selection => field.onChange(_.toArray(selection))}
          label="Personas"
          description={'More than one selected persona will result in multiple data calls'}
          {...field}
          onChange={undefined}
          value={undefined}
          defaultSelectedKeys={field.value}
          selectedKeys={field.value}
        >
          {personaStore.personas.map(persona => (
            <SelectItem
              key={persona.id}
              value={persona.id}
              description={persona.description}
              className={'w-full !min-w-[13ch] text-base-content'}
              classNames={{
                description: 'text',
              }}
            >
              {persona.name}
            </SelectItem>
          ))}
        </Select>
      )}
      control={control}
      name={`personaIds`}
    />
  )
}

const ConnectionSelect = () => {
  const { control } = useFormContext<ActorFormDataType>()

  return (
    <Controller
      render={({ field }) => (
        <Select
          selectionMode="multiple"
          size="sm"
          className="w-full min-w-[20ch] rounded-md bg-transparent hover:!bg-base-200"
          classNames={{
            value: '!text-base-content min-w-[20ch]',
            trigger: 'bg-transparent rounded-md border border-base-content/30 hover:!bg-base-100',
            popoverContent: 'text-base-content bg-base-100 rounded-md',
            description: 'text-base-content/45',
          }}
          onSelectionChange={selection => field.onChange(_.toArray(selection))}
          label="Connections"
          description={'More than one selected connection will result in multiple data calls'}
          {...field}
          onChange={undefined}
          value={undefined}
          defaultSelectedKeys={field.value}
          selectedKeys={field.value}
        >
          {connectionModelStore.connections.map(connection => (
            <SelectItem
              key={connection.id}
              value={connection.id}
              description={
                <>
                  {connection.host || connection.DefaultHost}
                  <br />
                  {serverConnectionByType[connection.type].getSnapshot().label}
                </>
              }
              className={'w-full !min-w-[13ch] text-base-content'}
              classNames={{
                description: 'text',
              }}
            >
              {connection.label}
            </SelectItem>
          ))}
        </Select>
      )}
      control={control}
      name={`connectionIds`}
    />
  )
}

const ActorFormWrapper = ({ actor }: { actor: IActorModel }) => {
  const methods = useForm<ActorFormDataType>({})

  const {
    reset,
    handleSubmit,
    formState: { isDirty, errors },
  } = methods

  const handleFormSubmit = handleSubmit(formData => {
    console.log('submitting form')

    actorStore.updateActor(formData)

    reset(formData)
  })

  const actorDataSnapshot = useMemo(() => {
    return getSnapshot(actor)
  }, [actor])

  const resetToSnapshot = () => reset(actorDataSnapshot, { keepDirty: false })

  useEffect(() => {
    resetToSnapshot()
  }, [actor])

  return (
    <FormProvider {...methods}>
      <div className="flex flex-1 flex-col rounded-md bg-base-200 px-2">
        <ScrollShadow className="h-full max-h-full">
          <ActorForm actor={actor} />
        </ScrollShadow>

        <div className="mt-auto flex justify-between py-2">
          <div>
            <button
              type="button"
              className="btn btn-ghost btn-sm mr-8 text-error"
              onClick={() => actorStore.deleteActor(actor)}
            >
              Delete Actor
            </button>
          </div>

          <div>
            <button
              type="button"
              className="btn btn-ghost btn-sm mx-4 text-base-content/60 hover:text-base-content"
              onClick={() => actorStore.duplicateActor(actor)}
              disabled={isDirty}
            >
              Duplicate <Copy />
            </button>
          </div>

          <div>
            <button
              type="button"
              className="btn btn-ghost btn-sm mx-4"
              onClick={() => reset()}
              disabled={!isDirty}
            >
              Reset
            </button>

            <button
              type="submit"
              className="btn btn-primary btn-sm"
              onClick={handleFormSubmit}
              disabled={!isDirty && _.isEmpty(errors)}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </FormProvider>
  )
}

export default ActorFormWrapper
