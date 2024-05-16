import { observer } from 'mobx-react-lite'
import { ChangeEvent, FormEvent, useEffect, useState } from 'react'

import { settingStore } from '~/models/SettingStore'

import Question from '~/icons/Question'
import Refresh from '~/icons/Refresh'

type HostInputProps = {
  defaultValue?: string
  fetchModels: () => void
  hasServer?: boolean
  isEnabled?: boolean
  label: string
  placeHolder: string
  setHost: (host: string) => void
}

const HostInput = observer(
  ({
    defaultValue,
    fetchModels,
    hasServer,
    isEnabled,
    label,
    placeHolder,
    setHost,
  }: HostInputProps) => {
    const [hostChanged, setHostChanged] = useState(false)

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      setHost(e.target.value)
      setHostChanged(true)
    }

    const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      fetchModels()
    }

    useEffect(() => {
      if (hasServer) {
        setHostChanged(false)
      }
    }, [hasServer])

    return (
      <form className="form-control" onSubmit={handleFormSubmit}>
        <div className="label pb-1 pt-0">
          <span className="label-text flex flex-row items-center gap-2 text-sm">
            {label}
            <div
              className="cursor-pointer"
              onClick={() => settingStore.openSettingsModal('connection')}
            >
              <Question />
            </div>
          </span>
        </div>

        <div className="flex flex-row items-center gap-2">
          <input
            type="text"
            id="host"
            className="input input-bordered w-full focus:outline-none"
            placeholder={placeHolder}
            defaultValue={defaultValue}
            onChange={handleInputChange}
            disabled={!isEnabled}
          />

          {isEnabled && (hostChanged || !hasServer) && (
            <button
              className={'btn btn-ghost px-2 align-middle'}
              type="submit"
              title="Refresh models"
            >
              <Refresh />
            </button>
          )}
        </div>
      </form>
    )
  },
)

export default HostInput
