import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import _ from 'lodash'

import FormInput from '~/components/form/FormInput'
import Drawer from '~/containers/Drawer'
import ModelAutoComplete from '~/components/form/ModelAutocomplete'

import Delete from '~/icons/Delete'

import { ActorModel } from '~/core/actor/ActorModel'
import { actorStore } from '~/core/actor/ActorStore'

export const ActorForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const actor = actorStore.getActorById(id!)!
  const methods = useForm<ActorModel>()

  const {
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { isDirty, errors },
  } = methods

  const modelId = watch('modelId') ?? undefined

  const handleFormSubmit = handleSubmit(formData => {
    console.log('submitting form')

    actorStore.updateActor(formData)

    reset(formData)

    navigate(-1)
  })

  const handleDelete = async () => {
    navigate(-1)

    await actorStore.destroyActor(actor)
  }

  useEffect(() => {
    reset(actor.source)
  }, [actor])

  return (
    <Drawer label={'Edit ' + (actor.label || 'unnamed actor')} outletContent={methods}>
      <FormProvider {...methods}>
        <form
          className="flex h-full w-full flex-col gap-2 overflow-scroll p-2"
          onSubmit={handleFormSubmit}
        >
          <Controller
            render={({ field }) => (
              <FormInput
                label="Actor name"
                placeholder={actor.source.name}
                errorMessage={errors.name?.message}
                {...field}
              />
            )}
            control={control}
            name="name"
            defaultValue={actor.source.name}
          />

          <ModelAutoComplete
            onModelSelected={(connectionId, modelId) => {
              setValue('connectionId', connectionId, { shouldDirty: true })
              setValue('modelId', modelId, { shouldDirty: true })
            }}
            selectedModelId={modelId}
          />

          {/* submit button */}
          <button />

          <div className="mt-auto flex justify-end gap-2 pt-2">
            <button
              className="btn mr-auto border-0 !bg-transparent text-error/50 md:btn-sm hover:text-error"
              onClick={handleDelete}
            >
              <Delete />
            </button>

            <button
              className="btn border-0 !bg-transparent text-error/50 md:btn-sm hover:text-error"
              onClick={() => reset()}
              disabled={!isDirty}
            >
              Reset
            </button>

            <button
              className="btn btn-primary outline-none md:btn-sm"
              type="submit"
              disabled={!isDirty}
            >
              Save
            </button>
          </div>
        </form>
      </FormProvider>
    </Drawer>
  )
}

export default ActorForm
