import { observer } from 'mobx-react-lite'
import { Control, Controller } from 'react-hook-form'
import { SnapshotIn } from 'mobx-state-tree'

import { IConnectionDataModel } from '~/models/types'
import { ServerConnectionTypes } from '~/features/connections/servers'

type EnabledCheckboxProps = {
  connection: ServerConnectionTypes
  control: Control<SnapshotIn<IConnectionDataModel>>
}

const EnabledCheckbox = observer(({ control, connection }: EnabledCheckboxProps) => {
  const { enabled } = connection

  return (
    <Controller
      render={({ field: { value, onChange } }) => {
        return (
          <label className="label w-fit gap-2">
            <span className="label-text">{connection.enabledLabel}</span>

            <div className="join">
              {[true, false].map((isEnabledOption, index) => (
                <button
                  type="button"
                  className={
                    'btn join-item btn-sm mr-0 ' +
                    (value === isEnabledOption ? 'btn-active cursor-default' : 'btn')
                  }
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
})

export default EnabledCheckbox
