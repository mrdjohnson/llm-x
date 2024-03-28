import { observer } from 'mobx-react-lite'
import { useEffect, useRef, MouseEvent } from 'react'
import { useForm } from 'react-hook-form'

import { IPersonaModel, personaStore } from '~/models/PersonaStore'

import Delete from '~/icons/Delete'
import Copy from '~/icons/Copy'
import Edit from '~/icons/Edit'

type PersonaItemProps = {
  persona: IPersonaModel
  isSelectedPersona: boolean
  shouldDimPersona?: boolean
}

const PersonaItem = observer(
  ({ persona, shouldDimPersona, isSelectedPersona }: PersonaItemProps) => {
    const deletePersona = (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()

      personaStore.deletePersona(persona)
    }

    const duplicatePersona = (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()

      personaStore.duplicatePersona(persona)
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
    register,
    setValue,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<PersonaFormDataType>({})

  const { personaToEdit } = personaStore

  const formRef = useRef<HTMLFormElement>(null)

  const handleFormSubmit = handleSubmit(formData => {
    const { name, description } = formData

    if (personaToEdit) {
      personaStore.editPersona(name, description)
    } else {
      personaStore.createPersona(name, description)
    }

    reset()
  })

  useEffect(() => {
    setValue('name', personaToEdit?.name || '')
    setValue('description', personaToEdit?.description || '')

    if (personaToEdit && formRef.current) {
      formRef.current.focus()
      formRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [personaToEdit])

  return (
    <form onSubmit={handleFormSubmit} className="mt-4 flex flex-col gap-2" ref={formRef}>
      <div>
        <label className="label-text">Name:</label>

        <input
          type="text"
          className="input input-sm input-bordered ml-2 max-w-full focus:outline-none"
          maxLength={30}
          minLength={2}
          placeholder="Store manager"
          {...register('name', { required: true, minLength: 2, maxLength: 30 })}
        />
      </div>

      <div className=" flex flex-col">
        <label className="label-text">Description:</label>

        <textarea
          rows={3}
          className="textarea textarea-bordered textarea-sm ml-2 mt-2 max-w-full resize-none focus:outline-none"
          placeholder="You are a store manager that is eager to help many customers"
          {...register('description', { required: true })}
        />
      </div>

      <div className="mt-2 flex justify-end gap-2">
        {personaToEdit && (
          <button
            className="btn btn-ghost btn-sm text-error/50 hover:text-error"
            onClick={() => personaStore.setPersonaToEdit(undefined)}
          >
            Cancel
          </button>
        )}

        <button className="btn btn-primary btn-sm" type="submit" disabled={!isValid}>
          {personaToEdit ? 'Edit Persona' : 'Create Persona'}
        </button>
      </div>
    </form>
  )
})

export const PersonaPanel = observer(() => {
  const { personas, selectedPersona } = personaStore

  return (
    <div className="no-scrollbar flex flex-col gap-2">
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
