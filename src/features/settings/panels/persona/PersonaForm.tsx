import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'

import FormInput from '~/components/form/FormInput'
import FormTextarea from '~/components/form/FormTextarea'

import Drawer from '~/containers/Drawer'
import Delete from '~/icons/Delete'

import { PersonaModel } from '~/core/persona/PersonaModel'
import { personaTable } from '~/core/persona/PersonaTable'
import { personaStore } from '~/core/persona/PersonaStore'

export const PersonaForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<PersonaModel>()

  const persona = personaStore.getPersonaById(id!)!

  const handleFormSubmit = handleSubmit(async formData => {
    await personaTable.put(formData)

    reset(formData)
  })

  const handleDelete = async () => {
    navigate(-1)

    await personaTable.destroy(persona)
  }

  const validateName = (name: string) => {
    if (name.length < 2 || name.length > 30) return 'Name length must be 2-30 chars'

    return true
  }

  useEffect(() => {
    reset(persona)
  }, [persona])

  return (
    <Drawer label={'Edit ' + persona.name}>
      <form onSubmit={handleFormSubmit} className="flex h-full flex-col gap-2 p-2">
        <Controller
          render={({ field }) => (
            <FormInput
              label="Name"
              errorMessage={errors.name?.message}
              placeholder="Store Manager"
              {...field}
            />
          )}
          control={control}
          name="name"
          rules={{
            validate: validateName,
          }}
        />

        <Controller
          render={({ field }) => (
            <FormTextarea
              rows={3}
              label="System Prompt (Description)"
              variant="bordered"
              labelPlacement="inside"
              placeholder="You are a store manager that is eager to help many customers"
              errorMessage={errors.description?.message}
              isMultiline
              {...field}
            />
          )}
          control={control}
          name="description"
          rules={{
            required: 'Please add a System Prompt',
          }}
        />

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
    </Drawer>
  )
}
