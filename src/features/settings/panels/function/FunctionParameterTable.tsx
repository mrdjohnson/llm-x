import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import _ from 'lodash'
import { useForm, Controller } from 'react-hook-form'

import { ICustomFunctionModel, IFunctionParameterModel } from '~/models/CustomFunctionStore'

import SelectionPanelTable, {
  SortType as SelectionPanelSortType,
} from '~/components/SelectionTablePanel'

import ChevronDown from '~/icons/ChevronDown'
import Check from '~/icons/Check'
import Delete from '~/icons/Delete'

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

type FunctionParameterRowProps = FunctionParameterTableProps & {
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
  [{ label: 'Name' }, { label: 'Type' }, { label: 'Description' }, { label: 'Required' }]

type FunctionParameterTableProps = {
  selectedCustomFunction: ICustomFunctionModel
}

const FunctionParameterTable = observer(
  ({ selectedCustomFunction }: FunctionParameterTableProps) => {
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
  },
)

export default FunctionParameterTable
