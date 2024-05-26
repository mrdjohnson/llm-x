import { observer } from 'mobx-react-lite'
import { useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'

import { ICustomFunctionModel, customFunctionStore } from '~/models/CustomFunctionStore'

import Delete from '~/icons/Delete'

import FunctionParameterTable from '~/features/settings/panels/function//FunctionParameterTable'

type FunctionFormPanelProps = {
  selectedCustomFunction: ICustomFunctionModel
}

type CustomFunctionFormDataType = {
  name: string
  description: string
  enabled: boolean
}

const FunctionFormPanel = observer(({ selectedCustomFunction }: FunctionFormPanelProps) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isValid, isDirty },
  } = useForm<CustomFunctionFormDataType>({})

  const formRef = useRef<HTMLFormElement>(null)

  const handleFormSubmit = handleSubmit(formData => {
    const { name, description, enabled } = formData

    customFunctionStore.editCustomFunction(selectedCustomFunction, {
      name,
      description,
      enabled,
    })

    reset(formData)
  })

  const validateName = (name: string) => {
    if (name.includes(' ')) return false

    return true
  }

  useEffect(() => {
    reset({
      name: selectedCustomFunction.name,
      description: selectedCustomFunction.description,
      enabled: selectedCustomFunction.enabled,
    })
  }, [selectedCustomFunction])

  return (
    <div className="flex h-full flex-col overflow-y-scroll">
      <form onSubmit={handleFormSubmit} className="mb-4 mt-2 flex flex-col gap-2" ref={formRef}>
        <Controller
          render={({ field }) => (
            <div className="join">
              {[true, false].map(isEnabled => (
                <button
                  className={
                    'btn join-item btn-sm mr-0 ' +
                    (field.value === isEnabled ? 'btn-active cursor-default ' : '')
                  }
                  type="button"
                  onClick={() => field.onChange(!field.value)}
                  key={isEnabled ? 0 : 1}
                >
                  <span>
                    {isEnabled ? 'Enable' : 'Disable'}
                    {field.value === isEnabled ? 'd' : '?'}
                  </span>
                </button>
              ))}
            </div>
          )}
          control={control}
          name="enabled"
          defaultValue={undefined}
        />

        <div>
          <label className="label-text">Function Name:</label>

          <input
            type="text"
            className="input input-sm input-bordered ml-2 max-w-full focus:outline-none"
            minLength={4}
            placeholder={selectedCustomFunction.name}
            {...register('name', { required: true, minLength: 4, validate: validateName })}
          />
        </div>

        <div className=" flex flex-col">
          <label className="label-text">Description:</label>

          <textarea
            rows={2}
            className="textarea textarea-bordered textarea-sm ml-2 mt-2 max-w-full resize-none focus:outline-none"
            placeholder="You are a store manager that is eager to help many customers"
            {...register('description', {})}
          />
        </div>
      </form>

      <div className="block">
        <FunctionParameterTable selectedCustomFunction={selectedCustomFunction} />
      </div>

      <div className="sticky bottom-0 mt-auto flex justify-between gap-4 bg-base-100 pt-4">
        <button
          className="btn btn-ghost btn-sm mr-8 text-error"
          onClick={() => customFunctionStore.deleteCustomFunction(selectedCustomFunction)}
        >
          <Delete />
        </button>

        <div>
          <button
            className="btn btn-ghost btn-sm mr-4 text-error"
            onClick={() => reset()}
            disabled={!isDirty}
          >
            Cancel
          </button>

          <button
            className="btn btn-ghost btn-primary btn-sm"
            disabled={!isValid || !isDirty}
            onClick={handleFormSubmit}
          >
            Save function
          </button>
        </div>
      </div>
    </div>
  )
})

export default FunctionFormPanel
