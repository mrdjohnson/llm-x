import { observer } from 'mobx-react-lite'
import { Controller, useFormContext } from 'react-hook-form'

import Question from '~/icons/Question'
import Refresh from '~/icons/Refresh'

import FormInput from '~/components/form/FormInput'
import { NavButtonDiv } from '~/components/NavButton'

import { ConnectionViewModelTypes } from '~/core/connection/viewModels'
import { ConnectionModel } from '~/core/connection/ConnectionModel'

type HostInputProps = {
  connection: ConnectionViewModelTypes
  isEnabled: boolean
}

const HostInput = observer(({ connection, isEnabled }: HostInputProps) => {
  const { host } = connection.source

  const {
    control,
    formState: { dirtyFields, errors },
  } = useFormContext<ConnectionModel>()

  const isDirty = dirtyFields.host

  const modelsFoundLabel = isDirty ? (
    'Save to see model length'
  ) : (
    <NavButtonDiv className="link" to={'/models/' + connection.id}>
      {connection.models.length} models found
    </NavButtonDiv>
  )

  return (
    <Controller
      render={({ field }) => (
        <FormInput
          label={connection.hostLabel}
          defaultValue={connection.DefaultHost}
          disabled={!isEnabled}
          placeholder={host}
          type="url"
          errorMessage={errors.host?.message}
          description={
            <span className="flex flex-col gap-2 align-baseline text-sm md:flex-row">
              <span className="flex align-baseline">
                See connection instructions here:
                <NavButtonDiv
                  to="/connection"
                  className="ml-2 flex items-center hover:text-base-content"
                >
                  <Question />
                </NavButtonDiv>
              </span>

              <span className="text-right text-sm md:ml-auto md:pl-2">{modelsFoundLabel}</span>
            </span>
          }
          endContent={
            isEnabled && (
              <button
                className={'btn btn-ghost btn-sm px-2'}
                type="button"
                title="Refresh models"
                onClick={() => connection.fetchLmModels()}
                disabled={isDirty}
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
      rules={{
        validate: connection.validateHost,
      }}
    />
  )
})

export default HostInput
