import { Control, Controller } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'

import { ConnectionViewModelTypes } from '~/core/connection/viewModels'
import { ConnectionModel } from '~/core/connection/ConnectionModel'

type EnabledCheckboxProps = {
  connection: ConnectionViewModelTypes
  control: Control<ConnectionModel>
}

const EnabledCheckbox = ({ control, connection }: EnabledCheckboxProps) => {
  const { enabled } = connection.source

  return (
    <Controller
      render={({ field: { value, onChange } }) => {
        return (
          <label className="label flex w-full flex-col gap-2 md:w-fit md:flex-row">
            <span className="label-text text-center text-lg md:text-medium">
              {connection.enabledLabel}
            </span>

            <div className="join mx-auto">
              {[true, false].map((isEnabledOption, index) => (
                <button
                  type="button"
                  className={twMerge(
                    'btn join-item btn-sm mr-0',
                    value === isEnabledOption && 'btn-active cursor-default',
                  )}
                  onClick={() => onChange(isEnabledOption)}
                  key={index}
                >
                  <span>
                    {isEnabledOption ? 'Enable' : 'Disable'}
                    {value === isEnabledOption ? 'd' : '?'}
                  </span>
                </button>
              ))}
            </div>
          </label>
        )
      }}
      control={control}
      name="enabled"
      defaultValue={enabled}
    />
  )
}

export default EnabledCheckbox
