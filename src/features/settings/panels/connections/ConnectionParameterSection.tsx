import { KeyboardEventHandler, MouseEventHandler } from 'react'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import _ from 'lodash'
import { Controller, useFieldArray, Control, useFormState, useWatch } from 'react-hook-form'
import { Checkbox, Select, SelectItem } from "@heroui/react"

import Delete from '~/icons/Delete'

import { ConnectionParameterModel } from '~/core/connection/ConnectionModel'

import ToolTip from '~/components/Tooltip'
import FormInput from '~/components/form/FormInput'
import SettingSection, { SettingSectionItem } from '~/containers/SettingSection'
import Drawer from '~/containers/Drawer'

type ParameterOptionsType = 'system' | 'valueRequired' | 'fieldRequired'

const parameterOptions: Array<{ key: ParameterOptionsType; label: string }> = [
  { key: 'system', label: 'Made by team llm-x' },
  { key: 'valueRequired', label: 'Is the value required?' },
  { key: 'fieldRequired', label: 'Is the field required by the api?' },
]

type ParameterFormOutletContext = { control: Control<{ parameters: ConnectionParameterModel[] }> }

export const ParameterForm = () => {
  const { parameterId } = useParams()
  const { control } = useOutletContext<ParameterFormOutletContext>()
  const navigate = useNavigate()

  const { errors } = useFormState({ control })

  const { fields: parameters, remove } = useFieldArray({
    control,
    name: 'parameters',
  })

  const index = _.findIndex(parameters, { field: parameterId })
  const parameter = parameters[index]

  // if this does not exist, go back
  // (reproduce by deleting a parameter on mobile and then pressing back)
  if (!parameter) {
    navigate(-1)
    return
  }

  const handleRemove = () => {
    navigate(-1)

    remove(index)
  }

  const validateUniqueField = (nextField: string) => {
    // skip if the field did not change
    if (parameter.field === parameter.field) return

    const otherParameter = _.find(parameters, { field: nextField })

    if (otherParameter) return 'Field names cannot be duplicates'

    // return true if field does not exist
    return true
  }

  const valueRequired = parameter.types?.includes('valueRequired')

  const validateValue = (nextValue?: string) => {
    if (parameter.isJson) {
      try {
        JSON.stringify(nextValue)
      } catch (e) {
        return 'Unable to parse this as JSON'
      }
    }

    if (valueRequired && _.isEmpty(nextValue) && _.isEmpty(parameter.defaultValue)) {
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

  const handleEnterPressedOnDrawer: KeyboardEventHandler<HTMLDivElement> = e => {
    if (e.key === 'Enter') {
      e.preventDefault()

      navigate(-1)
    }
  }

  return (
    <Drawer label={parameter.field}>
      <div
        className="flex h-full w-full flex-col gap-3 overflow-y-scroll rounded-md p-2"
        onKeyDown={handleEnterPressedOnDrawer}
      >
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
          <Controller
            render={({ field }) => (
              <Checkbox
                className="flex flex-row"
                classNames={{ label: 'flex flex-row justify-center align-middle' }}
                onChange={field.onChange}
                size="sm"
              >
                <div className="flex flex-row justify-center align-middle text-base-content">
                  <ToolTip label="Check this if this value is not supposed to be a string">
                    <span>Convert to JSON?</span>
                  </ToolTip>
                </div>
              </Checkbox>
            )}
            control={control}
            name={`parameters.${index}.isJson`}
            defaultValue={parameter.isJson || false}
          />
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
                  className="w-full !min-w-[13ch] text-base-content"
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

        <div className="mt-auto flex flex-row justify-between">
          <button
            type="button"
            className="btn btn-ghost btn-sm w-fit place-self-center text-error"
            disabled={parameter.types?.includes('fieldRequired')}
            onClick={handleRemove}
          >
            Delete Parameter
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-sm w-fit place-self-center"
            onClick={() => navigate(-1)}
          >
            Done
          </button>
        </div>
      </div>
    </Drawer>
  )
}

const ConnectionDataParameterSection = ({ subControl }: { subControl: unknown }) => {
  // we really just want the field array options
  const control = subControl as Control<{ parameters: ConnectionParameterModel[] }>
  const navigate = useNavigate()

  const { append, remove } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormProvider)
    name: 'parameters', // unique name for your Field Array
  })

  // we need to use this to get the updated ids
  const parameters = useWatch({ control, name: 'parameters' })

  const hasNewField = !!_.find(parameters, { field: 'newField' })

  const addParameter: MouseEventHandler<HTMLButtonElement> = e => {
    e.preventDefault()

    append({
      field: 'newField',
      label: '',
      helpText: '',
      types: [],
      isJson: false,
    })

    navigate('parameter/newField')
  }

  const removeParameterByIndex = (index: number) => {
    remove(index)
  }

  const parameterToSectionItem = (
    parameter: ConnectionParameterModel,
  ): SettingSectionItem<ConnectionParameterModel> => ({
    id: parameter.field,
    to: 'parameter/' + parameter.field,
    label: parameter.field,
    subLabels: parameter.helpText && [parameter.helpText],
    data: parameter,
  })

  const itemFilter = (parameter: ConnectionParameterModel, filterText: string) => {
    return (
      parameter.field.toLowerCase().includes(filterText) ||
      parameter.label?.toLowerCase().includes(filterText)
    )
  }

  // watched parameters still loading
  if (!parameters) return null

  return (
    <SettingSection
      items={parameters.map(parameterToSectionItem)}
      filterProps={{
        helpText: 'Filter parameters by field or label...',
        itemFilter,
        emptyLabel: 'No parameter fields or labels matches this filter',
      }}
      addButtonProps={{
        label: 'Add parameter',
        onClick: addParameter,
        isDisabled: hasNewField,
      }}
      renderActionRow={(parameter, index) => (
        <button
          type="button"
          className="btn btn-ghost btn-sm ml-auto justify-start px-2 text-error"
          disabled={parameter.types?.includes('fieldRequired')}
          onClick={() => _.isNumber(index) && removeParameterByIndex(index)}
        >
          <Delete />
        </button>
      )}
      isSubSection
    />
  )
}

export default ConnectionDataParameterSection
