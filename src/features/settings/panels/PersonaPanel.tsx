import { observer } from 'mobx-react-lite'
import { useEffect, useRef, MouseEvent } from 'react'
import { Controller, useForm } from 'react-hook-form'

import FormInput from '~/components/form/FormInput'
import FormTextarea from '~/components/form/FormTextarea'

import Delete from '~/icons/Delete'
import Copy from '~/icons/Copy'
import Edit from '~/icons/Edit'

import { PersonaModel } from '~/core/persona/PersonaModel'
import { personaTable } from '~/core/persona/PersonaTable'
import { personaStore } from '~/core/persona/PersonaStore'

type PersonaItemProps = {
  persona: PersonaModel
  isSelectedPersona: boolean
  shouldDimPersona?: boolean
}

const PersonaItem = observer(
  ({ persona, shouldDimPersona, isSelectedPersona }: PersonaItemProps) => {
    const deletePersona = async (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()

      await personaTable.destroy(persona)
    }

    const duplicatePersona = async (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()

      const nextPersona = await personaTable.duplicate(persona)
      await personaStore.setSelectedPersona(nextPersona)
    }

    const editPersona = (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()

      personaStore.setPersonaToEdit(persona)
    }

    return (
      <div
        className={
          'dropdown flex cursor-pointer flex-row items-center justify-between rounded-md p-4 even:bg-base-200 ' +
          (isSelectedPersona ? ' !bg-primary text-primary-content' : ' hover:!bg-primary/30') +
          (shouldDimPersona ? ' opacity-55' : '')
        }
        onClick={() => personaStore.setSelectedPersona(persona)}
      >
        <div className="flex flex-col">
          <span className="text-sm font-bold opacity-60">{persona.name}</span>

          <p className="pl-2">{persona.description}</p>
        </div>

        <div className="flex flex-row flex-nowrap">
          <button
            onClick={editPersona}
            className="mr-2 opacity-30 hover:scale-125 hover:opacity-90"
            title="Edit"
          >
            <Edit />
          </button>

          <button
            onClick={duplicatePersona}
            className="mr-2 opacity-30 hover:scale-125 hover:opacity-90"
            title="Duplicate"
          >
            <Copy />
          </button>

          <button
            onClick={deletePersona}
            className=" rounded-md text-error opacity-30 hover:scale-125 hover:opacity-90"
          >
            <Delete />
          </button>
        </div>
      </div>
    )
  },
)

type PersonaFormDataType = {
  name: string
  description: string
}

const PersonaForm = observer(() => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PersonaFormDataType>()

  const personaToEdit = personaStore.personaToEdit

  const formRef = useRef<HTMLFormElement>(null)

  const handleFormSubmit = handleSubmit(async formData => {
    const { name, description } = formData

    let nextPersonaToEdit: PersonaModel

    if (personaToEdit) {
      nextPersonaToEdit = await personaTable.put({ ...personaToEdit, name, description })
    } else {
      nextPersonaToEdit = await personaTable.create({ name, description })
    }

    personaStore.setSelectedPersona(nextPersonaToEdit)

    reset()
  })

  const validateName = (name: string) => {
    if (name.length < 2 || name.length > 30) return 'Name length must be 2-30 chars'

    return true
  }

  useEffect(() => {
    const { name = '', description = '' } = personaToEdit || {}

    reset({ name, description })

    if (personaToEdit && formRef.current) {
      formRef.current.focus()
      formRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [personaToEdit])

  return (
    <form onSubmit={handleFormSubmit} className="mt-auto flex flex-col gap-2" ref={formRef}>
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
            label="System Prompt"
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
      <div className="mt-2 flex justify-end gap-2">
        {personaToEdit && (
          <button
            className="btn btn-ghost btn-sm text-error/50 hover:text-error"
            onClick={() => personaStore.setPersonaToEdit(undefined)}
          >
            Cancel
          </button>
        )}

        <button className="btn btn-primary btn-sm outline-none" type="submit">
          {personaToEdit ? 'Edit Persona' : 'Create Persona'}
        </button>
      </div>
    </form>
  )
})

export const PersonaPanel = observer(() => {
  const { selectedPersona, personas } = personaStore

  return (
    <div className="no-scrollbar flex w-full flex-col gap-2 h-full overflow-scroll bg-base-100">
      <button
        className={'btn w-full ' + (selectedPersona ? '' : ' btn-primary')}
        onClick={() => personaStore.setSelectedPersona(undefined)}
      >
        Default (No persona)
      </button>

      {personas.map(persona => (
        <PersonaItem
          key={persona.id}
          persona={persona}
          isSelectedPersona={persona === selectedPersona}
        />
      ))}

      <PersonaForm />
    </div>
  )
})

export default PersonaPanel
