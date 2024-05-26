import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import _ from 'lodash'
import { useForm, Controller } from 'react-hook-form'
import { Select, SelectItem } from '@nextui-org/react'

import { ICustomFunctionModel, IFunctionParameterModel } from '~/models/CustomFunctionStore'

import SelectionPanelTable, {
  SortType as SelectionPanelSortType,
} from '~/components/SelectionTablePanel'

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
        <td className="align-top">
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

        <td className="align-top">
          <Controller
            render={({ field }) => (
              <Select
                className="rounded-lg border border-base-content/30 bg-transparent"
                size="sm"
                classNames={{
                  value: '!text-base-content min-w-[10ch]',
                  trigger: 'bg-base-100 hover:!bg-base-200',
                  popoverContent: 'text-base-content bg-base-100',
                }}
                {...field}
              >
                {parameterTypeOptions.map(parameterType => (
                  <SelectItem
                    key={parameterType}
                    value={parameterType}
                    onClick={() => field.onChange(parameterType)}
                    className={
                      'bg-base-100 text-base-content ' + parameterType === field.value
                        ? 'rounded-md bg-primary'
                        : 'rounded-md'
                    }
                  >
                    {parameterType}
                  </SelectItem>
                ))}
              </Select>
            )}
            control={control}
            name="type"
            defaultValue={undefined}
          />
        </td>

        <td className="align-top">
          <input
            className="input input-sm input-bordered block max-w-52 overflow-hidden bg-transparent font-semibold focus:outline-none xl:max-w-80"
            maxLength={100}
            {...register('description', { maxLength: 100 })}
          />
        </td>

        <td className="items-center align-top">
          <div className="flex flex-col gap-2">
            <input
              type="checkbox"
              className="checkbox checkbox-xs tooltip tooltip-bottom"
              data-tip="Required?"
              {...register('required', {})}
            />

            <div className="flex h-full w-full justify-end">
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
            </div>
          </div>
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
