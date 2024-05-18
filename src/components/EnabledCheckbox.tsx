import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'

type EnabledCheckboxProps = {
  label: string
  isEnabled?: boolean
  onChange: (isEnabled: boolean) => void
  fetchModels: () => void
}

const EnabledCheckbox = observer(
  ({ label, isEnabled = false, onChange, fetchModels }: EnabledCheckboxProps) => {
    useEffect(() => {
      if (isEnabled) {
        fetchModels()
      }
    }, [isEnabled])

    return (
      <label className="label w-fit cursor-pointer gap-2">
        <span className="label-text">{label}</span>

        <div className="join">
          {[true, false].map(isEnabledOption => (
            <button
              className={
                'btn join-item btn-sm mr-0 ' +
                (isEnabled === isEnabledOption ? 'btn-active cursor-default ' : 'btn ')
              }
              onClick={() => onChange(isEnabledOption)}
              key={isEnabledOption ? 0 : 1}
            >
              <span>
                {isEnabledOption ? 'Enable' : 'Disable'}
                {isEnabled === isEnabledOption ? 'd' : '?'}
              </span>
            </button>
          ))}
        </div>
      </label>
    )
  },
)

export default EnabledCheckbox
