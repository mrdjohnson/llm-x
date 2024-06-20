import { observer } from 'mobx-react-lite'
import { SnapshotIn } from 'mobx-state-tree'
import { Controller, useFormContext } from 'react-hook-form'

import { settingStore } from '~/models/SettingStore'

import Question from '~/icons/Question'
import Refresh from '~/icons/Refresh'

import FormInput from '~/components/form/FormInput'
import { ServerConnectionTypes } from '~/features/connections/servers'
import { IConnectionDataModel } from '~/models/types'

type HostInputProps = {
  connection: ServerConnectionTypes
  isEnabled: boolean
}

const HostInput = observer(({ connection, isEnabled }: HostInputProps) => {
  const { host } = connection

  const { control } = useFormContext<SnapshotIn<IConnectionDataModel>>()

  return (
    <Controller
      render={({ field }) => (
        <FormInput
          label={connection.hostLabel}
          defaultValue={connection.DefaultHost}
          disabled={!isEnabled}
          placeholder={host}
          description={
            <span className="flex gap-2 align-baseline text-sm">
              See connection instructions here:
              <button
                onClick={() => settingStore.openSettingsModal('connection')}
                className="hover:text-base-content"
                type="button"
              >
                <Question />
              </button>
            </span>
          }
          endContent={
            isEnabled && (
              <button
                className={'btn btn-ghost btn-sm px-2'}
                type="button"
                title="Refresh models"
                onClick={() => connection.fetchLmModels()}
              >
                <Refresh />
              </button>
            )
          }
          {...field}
        />
      )}
      control={control}
      name="host"
      defaultValue={host}
    />
  )
})

export default HostInput
