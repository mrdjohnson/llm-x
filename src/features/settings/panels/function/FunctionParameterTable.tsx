import { observer } from 'mobx-react-lite'
import _ from 'lodash'
import { Controller, useFormContext, useFieldArray, FieldArrayWithId } from 'react-hook-form'
import { Input, Select, SelectItem, Textarea } from '@nextui-org/react'

import SelectionPanelTable from '~/components/SelectionTablePanel'

import Delete from '~/icons/Delete'

import { CustomFunctionFormDataType } from '~/features/settings/panels/function/FunctionFormPanel'

type FunctionParameterFormDataType = {
  name: string
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

type FunctionParameterRowProps = {
  parameter: FieldArrayWithId<CustomFunctionFormDataType, 'parameters', 'id'>
  index: number
}

const FunctionParameterRow = observer(({ parameter, index }: FunctionParameterRowProps) => {
  const {
    register,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<CustomFunctionFormDataType>()
  const { fields: parameters } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormProvider)
    name: 'parameters', // unique name for your Field Array
  })

  const removeParameter = () => {
    // hack, remove from useValueFields was not working
    const nextParameters = _.reject(getValues('parameters'), { name: parameter.name })

    setValue('parameters', nextParameters, { shouldDirty: true })
  }

  const validateName = (nextName: string) => {
    console.log('name checking: ', nextName)

    if (nextName.includes(' ')) return 'Name cannot include a space'

    const otherParameter = _.filter(parameters, { name: nextName })

    // return true if name does not exist
    if (otherParameter.length > 1) return 'Parameter names cannot be duplicates'

    return true
  }

  return (
    <>
      <td className="align-top">
        <Input
          type="text"
          variant="bordered"
          // size="sm"
          defaultValue={parameter.name}
          isInvalid={!!errors.parameters?.[index]?.name?.message}
          errorMessage={errors.parameters?.[index]?.name?.message}
          className="max-w-52 xl:max-w-80"
          classNames={{
            inputWrapper: '!bg-base-transparent border-base-content/30',
          }}
          {...register(`parameters.${index}.name`, {
            required: 'Name is required',
            validate: validateName,
          })}
        />
      </td>

      <td className="align-top">
        <Controller
          render={({ field }) => (
            <Select
              className="rounded-md border border-base-content/30 bg-transparent"
              // size="sm"
              // variant="bordered"
              classNames={{
                value: '!text-base-content min-w-[13ch]',
                trigger: 'bg-base-100 hover:!bg-base-200 rounded-md',
                popoverContent: 'text-base-content bg-base-100',
              }}
              defaultSelectedKeys={[field.value]}
              isRequired
              {...field}
            >
              {parameterTypeOptions.map(parameterType => (
                <SelectItem
                  key={parameterType}
                  value={parameterType}
                  onClick={() => field.onChange(parameterType)}
                  className={
                    '!min-w-[13ch] text-base-content ' +
                    (parameterType === field.value ? 'bg-primary' : '')
                  }
                >
                  {parameterType}
                </SelectItem>
              ))}
            </Select>
          )}
          control={control}
          name={`parameters.${index}.type`}
          defaultValue={parameter.type}
        />
      </td>

      <td className="align-top">
        <Textarea
          minRows={1}
          maxRows={2}
          variant="bordered"
          size="sm"
          defaultValue={parameter.description}
          className="max-w-52 xl:max-w-80"
          classNames={{
            inputWrapper: '!bg-base-transparent border-base-content/30',
          }}
          {...register(`parameters.${index}.description`, {
            required: 'Name is description',
            maxLength: { value: 100, message: 'Description is too long' },
          })}
        />
      </td>

      <td className="items-center align-top">
        <div className="flex flex-col gap-2">
          <input
            type="checkbox"
            className="checkbox checkbox-xs tooltip tooltip-bottom"
            data-tip="Required?"
            {...register(`parameters.${index}.required`, {})}
          />

          <div className="mt-auto flex h-full w-full justify-end">
            <button
              onClick={removeParameter}
              type="button"
              className="btn btn-ghost btn-sm text-error"
            >
              <Delete />
            </button>
          </div>
        </div>
      </td>
    </>
  )
})

const FunctionParameterTable = observer(() => {
  const { control } = useFormContext<CustomFunctionFormDataType>()

  const { fields, append } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormProvider)
    name: 'parameters', // unique name for your Field Array
  })

  const addParam = () => {
    append({
      name: 'newParam',
      description: 'A sample parameter',
      type: 'string',
      required: false,
    })
  }

  const renderRow = (
    parameter: FieldArrayWithId<CustomFunctionFormDataType, 'parameters', 'id'>,
    index: number,
  ) => {
    return <FunctionParameterRow key={parameter.name} parameter={parameter} index={index} />
  }

  return (
    <SelectionPanelTable
      className="!h-fit min-h-[60px] !overflow-clip !pt-2"
      items={fields}
      sortTypes={[
        { label: 'Name' },
        { label: 'Type' },
        { label: 'Description' },
        { label: 'Required' },
      ]}
      renderRow={renderRow}
      onItemSelected={() => null}
      getIsItemSelected={() => false}
      getItemKey={(_field, index) => index}
    >
      <div className="flex justify-end">
        <button onClick={addParam} type="button" className="btn btn-primary btn-sm">
          Add a new param
        </button>
      </div>
    </SelectionPanelTable>
  )
})

export default FunctionParameterTable
