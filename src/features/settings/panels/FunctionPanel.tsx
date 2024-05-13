import { observer } from 'mobx-react-lite'
import { useEffect, useRef } from 'react'
import _ from 'lodash'
import { useForm, Controller } from 'react-hook-form'

import {
  ICustomFunctionModel,
  IFunctionParameterModel,
  customFunctionStore,
} from '~/models/CustomFunctionStore'
import ChevronDown from '~/icons/ChevronDown'
import Check from '~/icons/Check'
import Delete from '~/icons/Delete'

type CustomFunctionFormProps = {
  selectedCustomFunction: ICustomFunctionModel
}

type CustomFunctionFormDataType = {
  name: string
  description: string
  enabled: boolean
}

const CustomFunctionForm = observer(({ selectedCustomFunction }: CustomFunctionFormProps) => {
  const {
    register,
    setValue,
    handleSubmit,
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
  })

  useEffect(() => {
    setValue('name', selectedCustomFunction.name)
    setValue('description', selectedCustomFunction.description)
    setValue('enabled', selectedCustomFunction.enabled)
  }, [selectedCustomFunction])

  return (
    <form onSubmit={handleFormSubmit} className="my-4 flex flex-col gap-2" ref={formRef}>
      <div>
        <label className="label-text">Function Name:</label>

        <input
          type="text"
          className="input input-sm input-bordered ml-2 max-w-full focus:outline-none"
          minLength={4}
          placeholder={selectedCustomFunction.name}
          {...register('name', { required: true, minLength: 4 })}
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
        <button
          role="button"
          className="btn btn-ghost btn-sm text-error/50 hover:text-error"
          onClick={() => customFunctionStore.setSelectedCustomFunction(undefined)}
        >
          Cancel
        </button>

        <button className="btn btn-primary btn-sm" type="submit" disabled={!isValid || !isDirty}>
          Save Function
        </button>
      </div>
    </form>
  )
})

type FunctionParameterFormDataType = {
  nextName: string
  description: string
  type: 'undefined' | 'number' | 'string' | 'boolean' | 'bigint' | 'symbol' | 'object'
  required: boolean
}

const parameterTypeOptions: Array<FunctionParameterFormDataType['type']> = [
  'undefined',
  'string',
  'number',
  'boolean',
  'bigint',
  'symbol',
  'object',
]

type FunctionParameterRowProps = CustomFunctionFormProps & {
  name: string
  parameter: IFunctionParameterModel
}

const FunctionParameterRow = observer(
  ({ name, parameter, selectedCustomFunction }: FunctionParameterRowProps) => {
    const {
      register,
      control,
      handleSubmit,
      reset,
      formState: { isValid, isDirty },
    } = useForm<FunctionParameterFormDataType>({})

    const handleFormSubmit = handleSubmit(formData => {
      const { nextName, description, type, required } = formData

      selectedCustomFunction.editParameter(parameter, nextName, name, {
        description,
        type: type === 'undefined' ? undefined : type,
        required,
      })

      reset(formData)
    })

    const validateName = (nextName: string) => {
      console.log('name checking: ', nextName)
      if (nextName === name) return true

      if(nextName.includes(' ')) return false

      // does name already exist?
      return _.isUndefined(selectedCustomFunction.parameters.get(nextName))
    }

    useEffect(() => {
      reset({
        nextName: name,
        description: parameter.description,
        required: parameter.required,
        type: parameter.type || 'undefined',
      })
    }, [name, parameter])

    return (
      <tr className=" rounded-tl-md">
        <td>
          <input
            defaultValue={name}
            className="input input-sm input-bordered block max-w-52 overflow-hidden bg-transparent font-semibold focus:outline-none xl:max-w-80"
            {...register('nextName', {
              required: true,
              minLength: 4,
              validate: validateName,
            })}
          />
        </td>

        <td>
          <Controller
            render={({ field }) => (
              <div className="dropdown">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-sm m-1 flex min-w-[15ch] flex-row gap-2"
                >
                  {field.value} <ChevronDown className="ml-auto" />
                </div>

                <ul
                  tabIndex={0}
                  className="menu dropdown-content z-[1] min-w-[15ch] rounded-box bg-base-100 p-2 shadow"
                  role="select"
                  {...field}
                >
                  {parameterTypeOptions.map(parameterType => (
                    <li
                      key={parameterType}
                      value={parameterType}
                      onClick={() => field.onChange(parameterType)}
                      className={
                        parameterType === field.value ? 'rounded-md bg-primary' : 'rounded-md'
                      }
                    >
                      <a>{parameterType}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            control={control}
            name="type"
            defaultValue={undefined}
          />
        </td>

        <td>
          <input
            className="input input-sm input-bordered block max-w-52 overflow-hidden bg-transparent font-semibold focus:outline-none xl:max-w-80"
            maxLength={100}
            {...register('description', { maxLength: 100 })}
          />
        </td>

        <td className=" items-center">
          <input
            type="checkbox"
            className="checkbox checkbox-xs tooltip tooltip-bottom mx-auto"
            data-tip="Required?"
            {...register('required', {})}
          />
        </td>

        <td>
          <button
            className="btn btn-ghost btn-sm disabled:opacity-30"
            disabled={!isDirty || !isValid}
            onClick={handleFormSubmit}
          >
            <Check />
          </button>

          <button
            onClick={() => selectedCustomFunction.deleteParameter(parameter)}
            className="btn btn-ghost btn-sm text-error"
          >
            <Delete />
          </button>
        </td>
      </tr>
    )
  },
)

const FunctionParameterTable = observer(({ selectedCustomFunction }: CustomFunctionFormProps) => {
  const addParam = () => {
    selectedCustomFunction?.addParameter('newParam', {
      description: 'A sample parameter',
      type: 'string',
      required: false,
    })
  }

  const entries: Array<[string, IFunctionParameterModel]> = _.entries(
    selectedCustomFunction.parameters,
  )

  const makeHeader = (label: string) => {
    return (
      <th>
        <span className="flex w-fit select-none flex-row items-center">{label}</span>
      </th>
    )
  }

  return (
    <div className="mt-2 flex h-full w-full flex-col overflow-y-scroll rounded-md">
      <table className="table table-zebra table-sm -mt-4 mb-4 w-full border-separate border-spacing-y-2 pt-0">
        <thead className="sticky top-0 z-20 bg-base-300 text-base-content">
          <tr>
            {makeHeader('Name')}

            {makeHeader('Type')}

            {makeHeader('Description')}

            {makeHeader('Required')}

            {makeHeader('')}
          </tr>
        </thead>

        <tbody className="-mt-4 gap-2 px-2">
          {entries.map(([name, parameter]) => (
            <FunctionParameterRow
              name={name}
              parameter={parameter}
              selectedCustomFunction={selectedCustomFunction}
            />
          ))}
        </tbody>
      </table>

      <div>
        <button
          onClick={addParam}
          className="btn btn-primary btn-sm"
          disabled={selectedCustomFunction.hasUnnamedCustomParameter}
        >
          Add a new param
        </button>
      </div>
    </div>
  )
})

const FunctionPanel = observer(() => {
  const { selectedCustomFunction, customFunctions, hasUnnamedCustomFunction } = customFunctionStore

  const addFunction = async () => {
    const customFunction = customFunctionStore.createCustomFunction({
      description: 'A sample function',
    })

    customFunctionStore.setSelectedCustomFunction(customFunction)

    addParam()
  }

  const deleteFunction = () => {
    customFunctionStore.deleteCustomFunction(selectedCustomFunction)
  }

  const addParam = () => {
    selectedCustomFunction?.addParameter('newParam', {
      description: 'A sample parameter',
      type: 'string',
      required: false,
    })
  }

  return (
    <div className="h-full w-full p-2">
      <div className="flex flex-row items-center gap-2">
        {selectedCustomFunction && (
          <select
            className="select select-bordered select-sm flex items-center pb-1 leading-[2]"
            onChange={e => {
              const id = _.toNumber(e.target.value)
              const customFunction = _.find(customFunctions, { id })

              customFunctionStore.setSelectedCustomFunction(customFunction)
            }}
            value={selectedCustomFunction.id}
          >
            {customFunctions.map(({ name, id }) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        )}

        <button
          onClick={addFunction}
          className="btn btn-outline btn-primary btn-sm"
          disabled={hasUnnamedCustomFunction}
        >
          Add
        </button>

        <button
          onClick={deleteFunction}
          className="btn btn-outline btn-primary btn-sm"
          disabled={!selectedCustomFunction}
        >
          Delete
        </button>
      </div>

      {selectedCustomFunction && (
        <>
          <CustomFunctionForm selectedCustomFunction={selectedCustomFunction} />

          <FunctionParameterTable selectedCustomFunction={selectedCustomFunction} />
        </>
      )}
    </div>
  )
})

export default FunctionPanel
