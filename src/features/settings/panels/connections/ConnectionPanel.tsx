import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useMemo, useRef } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import _ from 'lodash'
import useMedia from 'use-media'
import { ScrollShadow } from '@heroui/scroll-shadow'

import HostInput from '~/components/HostInput'
import EnabledCheckbox from '~/components/EnabledCheckbox'
import FormInput from '~/components/form/FormInput'
import { NavButtonDiv } from '~/components/NavButton'

import { Drawer } from '~/containers/Drawer'

import Copy from '~/icons/Copy'
import Options from '~/icons/Options'
import Question from '~/icons/Question'

import { ConnectionModel } from '~/core/connection/ConnectionModel'
import { connectionStore } from '~/core/connection/ConnectionStore'
import ConnectionDataParameterSection from '~/features/settings/panels/connections/ConnectionParameterSection'

export type ConnectionFormDataType = ConnectionModel

const ConnectionPanel = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const isMobile = useMedia('(max-width: 768px)')

  const connection = connectionStore.getConnectionById(id)!
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

  const deleteConnection = async () => {
    await connectionStore.deleteConnection(connection)

    navigate('/models')
  }

  const duplicateConnection = async () => {
    const duplicate = await connectionStore.duplicateConnection(connection.source)

    navigate('/models')

    // this lets the drawer close first....then opens it back up
    setTimeout(() => {
      navigate('/models/edit/' + duplicate.id)
    }, 300)
  }

  useEffect(() => {
    resetToSnapshot()
  }, [connection])

  return (
    <Drawer label={'Edit ' + connection.label} outletContent={{ control }}>
      <div className="flex h-full w-full flex-col overflow-hidden px-2">
        <FormProvider {...methods}>
          <form className="contents" onSubmit={handleFormSubmit} ref={formRef}>
            <ScrollShadow className="flex h-full max-h-full flex-col gap-2 overflow-scroll ">
              <EnabledCheckbox connection={connection} control={control} />

              <Controller
                render={({ field }) => (
                  <FormInput
                    id={connection.id}
                    label="Connection display name"
                    disabled={!isEnabled}
                    placeholder={connection.label}
                    error={errors.label?.message}
                    description={
                      !connection.hostLabel && (
                        <span className="flex align-baseline">
                          See connection instructions here:
                          <NavButtonDiv
                            to={'/connection/' + connection.type}
                            className="ml-2 flex items-center hover:text-base-content"
                          >
                            <Question />
                          </NavButtonDiv>
                        </span>
                      )
                    }
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

              <div className="h-full rounded-lg bg-base-100 pt-0">
                <ConnectionDataParameterSection subControl={control} />
              </div>
            </ScrollShadow>

            <div className="mt-auto flex flex-shrink-0 flex-row justify-between gap-3 py-2 md:pb-2">
              {isMobile ? (
                <div className="dropdown dropdown-top">
                  <div tabIndex={0} role="button" className="btn btn-sm m-1 w-fit">
                    <Options />
                  </div>

                  <ul
                    tabIndex={0}
                    className="menu dropdown-content z-[1] w-52 rounded-box bg-base-100 p-2 shadow"
                  >
                    <li>
                      <button
                        type="button"
                        className="btn text-error"
                        key="delete"
                        onClick={deleteConnection}
                      >
                        Delete
                      </button>
                    </li>

                    <li>
                      <button
                        type="button"
                        className="btn"
                        key="duplicate"
                        onClick={duplicateConnection}
                        disabled={isDirty}
                      >
                        Duplicate <Copy />
                      </button>
                    </li>

                    <li>
                      <button
                        type="button"
                        className="btn"
                        key="reset"
                        disabled={!isDirty}
                        onClick={() => reset()}
                      >
                        Reset
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <>
                  <div>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm mr-8 w-full text-error md:btn-ghost md:text-error"
                      onClick={deleteConnection}
                    >
                      Delete Provider
                    </button>
                  </div>

                  <div>
                    <button
                      type="button"
                      className="btn btn-outline w-full text-base-content/60 md:btn-ghost md:btn-sm hover:text-base-content md:mx-4 md:text-base-content/60"
                      onClick={duplicateConnection}
                      disabled={isDirty}
                    >
                      Duplicate <Copy />
                    </button>
                  </div>
                </>
              )}

              <div className="flex flex-row justify-between">
                {!isMobile && (
                  <button
                    type="button"
                    className="btn btn-outline md:btn-ghost md:btn-sm md:mx-4"
                    onClick={() => reset()}
                    disabled={!isDirty}
                  >
                    Reset
                  </button>
                )}

                <button
                  type="submit"
                  className="min-height-4 btn btn-primary btn-sm h-auto md:btn-sm"
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
    </Drawer>
  )
}

export default ConnectionPanel
