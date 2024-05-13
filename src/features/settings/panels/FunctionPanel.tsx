import { observer } from 'mobx-react-lite'
import { useEffect, useRef, useState } from 'react'
import _ from 'lodash'
import { useForm, Controller } from 'react-hook-form'

import {
  ICustomFunctionModel,
  IFunctionParameterModel,
  customFunctionStore,
} from '~/models/CustomFunctionStore'

import BreadcrumbBar from '~/components/BreadcrumbBar'
import SelectionPanelTable, {
  SortType as SelectionPanelSortType,
} from '~/components/SelectionTablePanel'

import ChevronDown from '~/icons/ChevronDown'
import Check from '~/icons/Check'
import Delete from '~/icons/Delete'
import Edit from '~/icons/Edit'

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
                    (field.value === isEnabled ? 'btn-active cursor-default ' : 'btn ')
                  }
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

      if (nextName.includes(' ')) return false

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
      <>
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
      </>
    )
  },
)

const functionParameterSortTypes: Array<SelectionPanelSortType<[string, IFunctionParameterModel]>> =
  [
    { label: 'Name' }, //, value: 'name' },
    { label: 'Type' }, //, value: 'type' },
    { label: 'Description' }, //, value: 'description' },
    { label: 'Required' }, //, value: 'required' },
  ]

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

  const renderRow = ([name, parameter]: [string, IFunctionParameterModel]) => (
    <FunctionParameterRow
      key={name}
      name={name}
      parameter={parameter}
      selectedCustomFunction={selectedCustomFunction}
    />
  )

  return (
    <SelectionPanelTable
      className="!h-fit min-h-[60px] !overflow-clip !pt-2"
      items={entries}
      sortTypes={functionParameterSortTypes}
      renderRow={renderRow}
      onItemSelected={() => null}
      getIsItemSelected={() => false}
      getItemKey={([name]) => name}
      includeEmptyHeader
    >
      <div className="flex justify-end">
        <button
          onClick={addParam}
          className="btn btn-primary btn-sm"
          disabled={selectedCustomFunction.hasUnnamedCustomParameter}
        >
          Add a new param
        </button>
      </div>
    </SelectionPanelTable>
  )
})

const customFunctionSortTypes: Array<SelectionPanelSortType<ICustomFunctionModel>> = [
  { label: 'Name', value: 'name' },
  { label: 'Enabled', value: 'enabled' },
  { label: 'Description', value: 'description' },
]

const FunctionTablePanel = observer(({ onShowDetails }: { onShowDetails: () => void }) => {
  const { customFunctions, selectedCustomFunction } = customFunctionStore

  const handleCustomFunctionSelected = (customFunction: ICustomFunctionModel) => {
    customFunctionStore.setSelectedCustomFunction(customFunction)
  }

  const createCustomFunction = async () => {
    const customFunction = customFunctionStore.createCustomFunction({
      description: 'A sample function',
      parameters: {
        newParam: {
          description: 'A sample parameter',
          type: 'string',
          required: false,
        },
      },
    })

    customFunctionStore.setSelectedCustomFunction(customFunction)
  }

  const renderRow = (customFunction: ICustomFunctionModel) => (
    <>
      <td>{customFunction.name}</td>

      <td>
        <input
          type="checkbox"
          defaultChecked={customFunction.enabled}
          className="checkbox checkbox-xs tooltip tooltip-bottom"
          onClick={e => e.preventDefault()}
        />
      </td>

      <td>{customFunction.description}</td>

      <td className="w-fit">
        <button
          className="align-center flex opacity-30 transition-opacity duration-200 ease-in-out hover:opacity-100"
          onClick={onShowDetails}
        >
          <Edit />
        </button>
      </td>
    </>
  )

  return (
    <SelectionPanelTable
      items={customFunctions}
      sortTypes={customFunctionSortTypes}
      primarySortTypeLabel="name"
      itemFilter={(customFunction: ICustomFunctionModel, filterText: string) =>
        [customFunction.name.toLowerCase(), customFunction.description.toLowerCase()].includes(
          filterText.toLowerCase(),
        )
      }
      renderRow={renderRow}
      getItemKey={customFunction => customFunction.id}
      onItemSelected={handleCustomFunctionSelected}
      getIsItemSelected={customFunction => customFunction === selectedCustomFunction}
      filterInputPlaceholder="Filter by name or description..."
    >
      <div className="mt-4 flex justify-end gap-4">
        <button
          className="btn btn-neutral btn-sm flex w-fit flex-row gap-2 text-error"
          onClick={() => customFunctionStore.setSelectedCustomFunction(undefined)}
          disabled={!selectedCustomFunction}
        >
          Clear Selection
        </button>

        <button
          className="btn btn-neutral btn-sm flex w-fit flex-row gap-2"
          onClick={createCustomFunction}
          disabled={customFunctionStore.hasUnnamedCustomFunction}
        >
          Add New Function
        </button>
      </div>
    </SelectionPanelTable>
  )
})

const FunctionPanel = observer(() => {
  const { selectedCustomFunction } = customFunctionStore

  const [tab, setTab] = useState<'all' | 'single'>('all')

  useEffect(() => {
    // if the model changes, go into model settings
    if (!selectedCustomFunction) {
      setTab('all')
    }
  }, [selectedCustomFunction])

  return (
    <div className="relative flex h-full w-full flex-col">
      <BreadcrumbBar
        breadcrumbs={[
          {
            label: 'Functions',
            isSelected: tab === 'all',
            onClick: () => setTab('all'),
          },
          selectedCustomFunction && {
            label: selectedCustomFunction.name,
            isSelected: tab === 'single',
            onClick: () => setTab('single'),
          },
        ]}
      />

      {tab === 'all' || !selectedCustomFunction ? (
        <FunctionTablePanel onShowDetails={() => setTab('single')} />
      ) : (
        <CustomFunctionForm selectedCustomFunction={selectedCustomFunction} />
      )}
    </div>
  )
})

export default FunctionPanel
