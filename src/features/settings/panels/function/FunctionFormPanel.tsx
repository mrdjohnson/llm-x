import { observer } from 'mobx-react-lite'
import { useEffect, useRef } from 'react'
import { useForm, Controller, FormProvider } from 'react-hook-form'
import { Input, Textarea } from '@nextui-org/react'

import {
  ICustomFunctionModel,
  IFunctionParameterModel,
  customFunctionStore,
} from '~/models/CustomFunctionStore'

import Delete from '~/icons/Delete'

import FunctionParameterTable from '~/features/settings/panels/function//FunctionParameterTable'
import { SnapshotIn, getSnapshot } from 'mobx-state-tree'
import _ from 'lodash'

type FunctionFormPanelProps = {
  selectedCustomFunction: ICustomFunctionModel
}

export type CustomFunctionFormDataType = SnapshotIn<ICustomFunctionModel>

const FunctionFormPanel = observer(({ selectedCustomFunction }: FunctionFormPanelProps) => {
  const methods = useForm<CustomFunctionFormDataType>({})

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isDirty, errors },
  } = methods

  const formRef = useRef<HTMLFormElement>(null)

  const handleFormSubmit = handleSubmit(formData => {
    const { name, description, enabled, parameters } = formData

    customFunctionStore.editCustomFunction(selectedCustomFunction, {
      name,
      description,
      enabled,
      parameters,
    })

    reset(formData)
  })

  const validateName = (name: string) => {
    console.log('validating name: ', name)

    if (name.includes(' ')) return 'Name cannot contain spaces'

    return true
  }

  useEffect(() => {
    reset(getSnapshot(selectedCustomFunction))
  }, [selectedCustomFunction])

  return (
    <div className="flex h-full flex-col overflow-y-scroll">
      <FormProvider {...methods}>
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

          <Input
            type="text"
            label="Function Name:"
            variant="bordered"
            defaultValue={selectedCustomFunction.name}
            isInvalid={!!errors.name?.message}
            errorMessage={errors.name?.message}
            className="max-w-full"
            classNames={{
              inputWrapper: '!bg-base-transparent border-base-content/30',
            }}
            {...register('name', {
              required: 'Name is required',
              minLength: { value: 4, message: 'Name needs to be at least 4 characters' },
              validate: validateName,
            })}
          />

          <Textarea
            label="Description"
            defaultValue={selectedCustomFunction.description}
            placeholder=""
            minRows={2}
            maxRows={3}
            variant="bordered"
            classNames={{
              inputWrapper: '!bg-base-transparent border-base-content/30',
            }}
            {...register('description')}
          />

          <div className="block">
            <FunctionParameterTable />
          </div>
        </form>
      </FormProvider>

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
            disabled={!isDirty}
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
