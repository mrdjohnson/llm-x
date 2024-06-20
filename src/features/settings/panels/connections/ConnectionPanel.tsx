import { observer } from 'mobx-react-lite'
import { SnapshotIn, getSnapshot } from 'mobx-state-tree'
import { useEffect, useMemo, useRef } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import _ from 'lodash'
import { ScrollShadow } from '@nextui-org/react'

import { ServerConnectionTypes } from '~/features/connections/servers'
import ConnectionDataParameterSection from '~/features/settings/panels/connections/ConnectionParameterSection'
import { connectionModelStore } from '~/features/connections/ConnectionModelStore'

import HostInput from '~/components/HostInput'
import EnabledCheckbox from '~/components/EnabledCheckbox'
import FormInput from '~/components/form/FormInput'

import { IConnectionDataModel } from '~/models/types'
import Copy from '~/icons/Copy'

export type ConnectionFormDataType = SnapshotIn<IConnectionDataModel>

const ConnectionPanel = observer(({ connection }: { connection: ServerConnectionTypes }) => {
  const methods = useForm<ConnectionFormDataType>({})

  const formRef = useRef<HTMLFormElement>(null)

  const {
    handleSubmit,
    control,
    reset,
    getValues,
    formState: { isDirty, errors, dirtyFields },
  } = methods

  const handleFormSubmit = handleSubmit(formData => {
    console.log('submitting form')

    const isHostChanged = !!dirtyFields.host

    connectionModelStore.updateDataModel(formData, isHostChanged)

    reset(formData)
  })

  const isEnabled = !!getValues('enabled')

  const connectionDataSnapshot = useMemo(() => {
    return getSnapshot(connection.connectionModel)
  }, [connection])

  const resetToSnapshot = () => reset(connectionDataSnapshot, { keepDirty: false })

  const validateLabel = (label: string): boolean | string => {
    if (label.length < 2 || label.length > 30) return 'Label must be 2-30 chars'

    return true
  }

  useEffect(() => {
    resetToSnapshot()
  }, [connection])

  return (
    <div className="flex h-full w-full flex-col">
      <FormProvider {...methods}>
        <form className="contents" onSubmit={handleFormSubmit} ref={formRef}>
          <ScrollShadow className="h-full max-h-full">
            <div className="my-2 flex w-full flex-col gap-2 overflow-scroll">
              <EnabledCheckbox connection={connection} control={control} />

              <Controller
                render={({ field }) => (
                  <FormInput
                    id={connection.id}
                    label="Connection display name"
                    disabled={!isEnabled}
                    placeholder={connection.label}
                    errorMessage={errors.label?.message}
                    {...field}
                  />
                )}
                control={control}
                name="label"
                defaultValue={connection.label}
                rules={{
                  validate: (label: string) => validateLabel(label),
                }}
              />

              <HostInput connection={connection} isEnabled={isEnabled} />

              <ConnectionDataParameterSection />
            </div>
          </ScrollShadow>

          <div className="mt-auto flex justify-between py-2">
            <div>
              <button
                type="button"
                className="btn btn-ghost btn-sm mr-8 text-error"
                onClick={() => connectionModelStore.deleteConnection(connection.id)}
              >
                Delete Connection
              </button>
            </div>

            <div>
              <button
                type="button"
                className="btn btn-ghost btn-sm mx-4 text-base-content/60 hover:text-base-content"
                onClick={() => connectionModelStore.duplicateConnection(connection.id)}
                disabled={isDirty}
              >
                Duplicate <Copy />
              </button>
            </div>

            <div>
              <button
                type="button"
                className="btn btn-ghost btn-sm mx-4"
                onClick={() => reset()}
                disabled={!isDirty}
              >
                Reset
              </button>

              <button
                type="submit"
                className="btn btn-primary btn-sm"
                onClick={handleFormSubmit}
                disabled={!isDirty && _.isEmpty(errors)}
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  )
})

export default ConnectionPanel
