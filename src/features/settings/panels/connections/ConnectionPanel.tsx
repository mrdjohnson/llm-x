import { observer } from 'mobx-react-lite'
import { useEffect, useMemo, useRef } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import _ from 'lodash'
import { ScrollShadow } from '@nextui-org/react'

import HostInput from '~/components/HostInput'
import EnabledCheckbox from '~/components/EnabledCheckbox'
import FormInput from '~/components/form/FormInput'

import Copy from '~/icons/Copy'
import { ConnectionModel } from '~/core/connection/ConnectionModel'
import { ConnectionViewModelTypes } from '~/core/connection/viewModels'
import { connectionStore } from '~/core/connection/ConnectionStore'
import ConnectionDataParameterSection from '~/features/settings/panels/connections/ConnectionParameterSection'

export type ConnectionFormDataType = ConnectionModel

const ConnectionPanel = observer(({ connection }: { connection: ConnectionViewModelTypes }) => {
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

    connectionStore.updateDataModel(formData, isHostChanged)

    reset(formData)
  })

  const isEnabled = !!getValues('enabled')

  const connectionDataSnapshot = useMemo(() => {
    return _.cloneDeep(connection.source)
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

              {connection.hostLabel && <HostInput connection={connection} isEnabled={isEnabled} />}

              <ConnectionDataParameterSection />
            </div>
          </ScrollShadow>

          <div className="mt-auto flex flex-col justify-between gap-3 pt-2 md:flex-row md:pb-2">
            <div>
              <button
                type="button"
                className="btn btn-outline btn-sm mr-8 w-full text-error md:btn-ghost md:text-error"
                onClick={() => connectionStore.deleteConnection(connection)}
              >
                Delete Connection
              </button>
            </div>

            <div>
              <button
                type="button"
                className="btn btn-outline w-full text-base-content/60 md:btn-ghost md:btn-sm hover:text-base-content md:mx-4 md:text-base-content/60"
                onClick={() => connectionStore.duplicateConnection(connection.source)}
                disabled={isDirty}
              >
                Duplicate <Copy />
              </button>
            </div>

            <div className="flex flex-row justify-between">
              <button
                type="button"
                className="btn btn-outline md:btn-ghost md:btn-sm md:mx-4"
                onClick={() => reset()}
                disabled={!isDirty}
              >
                Reset
              </button>

              <button
                type="submit"
                className="btn btn-primary md:btn-sm"
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
