import { MouseEventHandler, useCallback, useMemo, useState } from 'react'
import _ from 'lodash'
import { Controller, useFormContext, useFieldArray } from 'react-hook-form'
import { Checkbox, Select, SelectItem } from '@nextui-org/react'

import Delete from '~/icons/Delete'
import Back from '~/icons/Back'

import { ConnectionFormDataType } from '~/features/settings/panels/connections/ConnectionPanel'
import ToolTip from '~/components/Tooltip'
import FormInput from '~/components/form/FormInput'

type ParameterOptionsType = 'system' | 'valueRequired' | 'fieldRequired'

const parameterOptions: Array<{ key: ParameterOptionsType; label: string }> = [
  { key: 'system', label: 'Made by team llm-x' },
  { key: 'valueRequired', label: 'Is the value required?' },
  { key: 'fieldRequired', label: 'Is the field required by the api?' },
]

type ConnectionDataParameterRowProps = {
  index: number
  onRemove: () => void
}

const ParameterForm = ({ index, onRemove }: ConnectionDataParameterRowProps) => {
  const {
    register,
    control,
    getValues,
    formState: { errors },
  } = useFormContext<ConnectionFormDataType>()
  const { fields: parameters } = useFieldArray({
    control,
    name: 'parameters',
  })

  const parameter = parameters[index]
  const currentParameter = getValues(`parameters.${index}`)

  if (!parameter || !currentParameter) return null

  const validateUniqueField = (nextField: string) => {
    // skip if the field did not change
    if (currentParameter.field === parameter.field) return

    const otherParameter = _.find(parameters, { field: nextField })

    if (otherParameter) return 'Field names cannot be duplicates'

    // return true if field does not exist
    return true
  }

  const valueRequired = currentParameter.types?.includes('valueRequired')

  const validateValue = (nextValue?: string) => {
    if (currentParameter.isJson) {
      try {
        JSON.stringify(nextValue)
      } catch (e) {
        return 'Unable to parse this as JSON'
      }
    }

    if (valueRequired && _.isEmpty(nextValue) && _.isEmpty(currentParameter.defaultValue)) {
      return 'A value or default value is required'
    }

    return true
  }

  const validateDefaultValue = (nextDefaultValue?: string) => {
    if (parameter.isJson) {
      try {
        JSON.stringify(nextDefaultValue)
      } catch (e) {
        return 'Unable to parse this as JSON'
      }
    }

    return true
  }

  console.log('field: ', getValues(`parameters.${index}.label`), currentParameter.label)
  console.log('parameter types: ', currentParameter.types)
  console.log('valueRequired: ', valueRequired)

  return (
    <div className="m-2 ml-0 flex w-full flex-col gap-3 overflow-y-scroll rounded-md bg-base-100 p-2">
      <Controller
        render={({ field }) => (
          <FormInput
            label="Field Name"
            defaultValue={parameter.field}
            errorMessage={errors.parameters?.[index]?.field?.message}
            isRequired
            {...field}
          />
        )}
        control={control}
        name={`parameters.${index}.field`}
        defaultValue={parameter.field}
        rules={{
          validate: validateUniqueField,
        }}
      />

      <div className="flex flex-row gap-2">
        <Controller
          render={({ field }) => (
            <FormInput
              label="Value"
              defaultValue={parameter.value}
              errorMessage={errors.parameters?.[index]?.value?.message}
              {...field}
            />
          )}
          control={control}
          name={`parameters.${index}.value`}
          defaultValue={parameter.value}
          rules={{
            validate: validateValue,
          }}
        />

        <Controller
          render={({ field }) => (
            <FormInput
              label="Default Value"
              defaultValue={parameter.defaultValue}
              errorMessage={errors.parameters?.[index]?.defaultValue?.message}
              {...field}
            />
          )}
          control={control}
          name={`parameters.${index}.defaultValue`}
          defaultValue={parameter.defaultValue}
          rules={{
            validate: validateDefaultValue,
          }}
        />
      </div>

      <div className="flex justify-center gap-3">
        <Checkbox
          className="flex flex-row"
          classNames={{ label: 'flex flex-row justify-center align-middle' }}
          {...register(`parameters.${index}.isJson`)}
          size="sm"
        >
          <div className="flex flex-row justify-center align-middle text-base-content">
            <ToolTip label="Check this if this value is not supposed to be a string">
              <span>Convert to JSON?</span>
            </ToolTip>
          </div>
        </Checkbox>
      </div>

      <Controller
        render={({ field }) => (
          <FormInput label="Display Name" defaultValue={parameter.label} {...field} />
        )}
        control={control}
        name={`parameters.${index}.label`}
        defaultValue={parameter.label}
      />

      <Controller
        render={({ field }) => (
          <FormInput
            label="Help text: What is this field for?"
            defaultValue={parameter.helpText}
            {...field}
          />
        )}
        control={control}
        name={`parameters.${index}.helpText`}
        defaultValue={parameter.helpText}
      />

      <Controller
        render={({ field }) => (
          <Select
            className="w-full min-w-[20ch] rounded-md border border-base-content/30 bg-transparent"
            selectionMode="multiple"
            size="sm"
            // variant="bordered"
            classNames={{
              value: '!text-base-content min-w-[20ch]',
              trigger: 'bg-base-100 hover:!bg-base-200 rounded-md',
              popoverContent: 'text-base-content bg-base-100',
            }}
            defaultSelectedKeys={field.value}
            onSelectionChange={selection => field.onChange(_.toArray(selection))}
            label="Classification"
            {...field}
            onChange={undefined}
          >
            {parameterOptions.map(({ key: parameterType, label }) => (
              <SelectItem
                key={parameterType}
                value={parameterType}
                description={label}
                className={'w-full !min-w-[13ch] text-base-content'}
                classNames={{
                  description: ' text',
                }}
              >
                {parameterType}
              </SelectItem>
            ))}
          </Select>
        )}
        control={control}
        name={`parameters.${index}.types`}
        defaultValue={parameter.types}
      />

      <button
        type="button"
        className="btn btn-ghost btn-sm mt-auto w-fit place-self-center text-error"
        disabled={currentParameter.types?.includes('fieldRequired')}
        onClick={onRemove}
      >
        Delete Parameter
      </button>
    </div>
  )
}

const ConnectionDataParameterSection = () => {
  const { control } = useFormContext<ConnectionFormDataType>()

  const [selectedIndex, setSelectedIndex] = useState<number | undefined>()
  const [filterText, setFilterText] = useState('')

  const {
    fields: parameters,
    append,
    remove,
  } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormProvider)
    name: 'parameters', // unique name for your Field Array
  })

  const hasNewField = !!_.find(parameters, { field: 'newField' })
  const hasSelectedParameter = selectedIndex !== undefined

  const filteredParameters = useMemo(() => {
    const lowerCaseFilter = filterText.toLowerCase()
    return parameters.filter(
      parameter =>
        parameter.field.toLowerCase().includes(lowerCaseFilter) ||
        parameter.label?.toLowerCase().includes(lowerCaseFilter),
    )
  }, [parameters, filterText])

  const addParameter: MouseEventHandler<HTMLButtonElement> = e => {
    e.preventDefault()

    append({
      field: 'newField',
      label: '',
      helpText: '',
      types: [],
      isJson: false,
    })

    setSelectedIndex(parameters.length)
  }

  const removeParameterByIndex = (index: number) => {
    setSelectedIndex(undefined)

    remove(index)
  }

  const Form = useCallback(
    () =>
      hasSelectedParameter && (
        <ParameterForm
          index={selectedIndex}
          onRemove={() => removeParameterByIndex(selectedIndex)}
        />
      ),
    [selectedIndex, parameters, hasSelectedParameter],
  )

  return (
    <div className="flex h-full max-h-full flex-col rounded-md bg-base-200">
      <div className="flex w-full flex-row gap-2 p-2 pb-0 align-middle">
        {hasSelectedParameter && (
          <button type="button" onClick={() => setSelectedIndex(undefined)}>
            <Back />
          </button>
        )}
        <span className="content-center">Parameters:</span>
        <FormInput
          value={filterText}
          placeholder="Filter parameters by field or label..."
          onChange={e => setFilterText(e.target.value)}
        />
      </div>

      <div className="flex h-full flex-row">
        <ul
          className={
            'menu rounded-box bg-base-200 p-0 pt-1 ' + (hasSelectedParameter ? 'w-fit' : 'w-full')
          }
        >
          {filteredParameters.map((parameter, index) => (
            <li
              key={parameter.field}
              onClick={() => setSelectedIndex(index)}
              className={
                'mx-2 rounded-md ' +
                (selectedIndex === index ? 'bg-base-content/10' : 'bg-base-300')
              }
            >
              {hasSelectedParameter ? (
                <span className="max-w-[15ch] justify-center">{parameter.field}</span>
              ) : (
                <div className="flex flex-col px-2 *:text-left">
                  <div className="flex w-full flex-row self-start text-left">
                    <span className="mr-3 content-center">{parameter.field}</span>
                    <span className="content-center text-sm font-semibold text-base-content/30">
                      {parameter.label}
                    </span>

                    <button
                      type="button"
                      className="btn btn-ghost btn-sm ml-auto justify-start pl-3 text-error"
                      disabled={parameter.types?.includes('fieldRequired')}
                      onClick={() => removeParameterByIndex(index)}
                    >
                      <Delete />
                    </button>
                  </div>

                  {parameter.helpText && (
                    <p className="line-clamp-2 self-start text-base-content/45">
                      {parameter.helpText}
                    </p>
                  )}
                </div>
              )}
            </li>
          ))}

          {!filteredParameters[0] && parameters[0] && (
            <span className="pt-6 text-center font-semibold text-base-content/30">
              No parameter fields or labels matches this filter
            </span>
          )}

          <li className="mx-2 mt-auto pt-4">
            <button
              type="button"
              className="btn btn-primary btn-sm mb-1 whitespace-nowrap"
              onClick={addParameter}
              disabled={hasNewField}
            >
              Add parameter
            </button>
          </li>
        </ul>

        <Form />
      </div>
    </div>
  )
}

export default ConnectionDataParameterSection
