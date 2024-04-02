import { observer } from 'mobx-react-lite'

import { ChangeEvent, FormEvent, useEffect, useState } from 'react'

import Question from '~/icons/Question'
import { DefaultA1111Host, DefaultHost, settingStore } from '~/models/SettingStore'
import ModelRefreshButton from '~/components/ModelRefreshButton'
import Refresh from '~/icons/Refresh'

const HostInput = observer(() => {
  const [hostChanged, setHostChanged] = useState(false)
  const hasServer = settingStore.isServerConnected

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    settingStore.setHost(e.target.value)
    setHostChanged(true)
  }

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    settingStore.updateModels()
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
          Host:
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
          placeholder={DefaultHost}
          defaultValue={settingStore.host}
          onChange={handleInputChange}
        />

        <ModelRefreshButton small shouldShow={hostChanged} />
      </div>
    </form>
  )
})

export const A1111HostInput = observer(() => {
  const [hostChanged, setHostChanged] = useState(true)
  const hasServer = settingStore.isServerConnected

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    settingStore.setA1111Host(e.target.value)
    setHostChanged(true)
  }

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    settingStore.fetchA1111Models()
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
          AUTOMATIC1111 Host:
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
          id="a1111Host"
          className="input input-bordered w-full focus:outline-none"
          placeholder={DefaultA1111Host}
          defaultValue={settingStore.a1111Host}
          onChange={handleInputChange}
          disabled={!settingStore.a1111Enabled}
        />

        {(hostChanged || !hasServer) && (
          <button
            className={'btn btn-ghost px-2 align-middle'}
            type="button"
            onClick={() => settingStore.fetchA1111Models()}
            title="Refresh models"
          >
            <Refresh />
          </button>
        )}
      </div>
    </form>
  )
})

export default HostInput
