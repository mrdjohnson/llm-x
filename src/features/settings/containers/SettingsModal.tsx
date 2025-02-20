import { useEffect, useMemo, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import _ from 'lodash'
import useMedia from 'use-media'
import { Modal, ModalContent, ModalBody, Select, SelectItem } from '@heroui/react'
import { NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { twMerge } from 'tailwind-merge'

import DaisyUiThemeProvider from '~/containers/DaisyUiThemeProvider'
import Drawer from '~/containers/Drawer'

import { NavButton } from '~/components/NavButton'

import Github from '~/icons/Github'
import Back from '~/icons/Back'

import {
  SettingPanelOptionsType,
  SettingPanelType,
  settingRoutesByName,
} from '~/features/settings/settingRoutes'

import SettingSearchBar from '~/features/settings/SettingSearchBar'

const SettingsSidePanel = observer(
  ({ onSectionClick }: { onSectionClick?: (panelName: SettingPanelOptionsType) => void }) => {
    return _.map(
      settingRoutesByName,
      ({ mobileOnly, label, hidden }: SettingPanelType, panelName: SettingPanelOptionsType) => {
        if (mobileOnly || !label) return <div key={panelName} />
        if (hidden) return null

        return (
          <NavLink
            to={panelName}
            key={panelName}
            className={({ isActive }) =>
              twMerge('btn w-full justify-start', isActive && 'btn-neutral')
            }
            onClick={() => onSectionClick?.(panelName)}
            role="link"
          >
            {label}
          </NavLink>
        )
      },
    )
  },
)

const MobileSettingsSidePanel = observer(() => {
  const navigate = useNavigate()
  const { pathname: selectedPanel } = useLocation()

  const goToSection = (path: string) => {
    //  reset the route to initial first
    navigate('/initial', { replace: true })

    navigate(path)
  }

  const routes = useMemo(() => {
    return _.omitBy(settingRoutesByName, { hidden: true })
  }, [])

  if (selectedPanel === '/search') return null

  return (
    <Select
      className="w-full min-w-[20ch] rounded-md border border-base-content/30 bg-transparent"
      size="sm"
      classNames={{
        value: '!text-base-content min-w-[20ch]',
        trigger: 'bg-base-100 hover:!bg-base-200 rounded-md',
        popoverContent: 'text-base-content bg-base-100',
      }}
      selectedKeys={[selectedPanel]}
      label="Section"
      onChange={selection => goToSection(selection.target.value)}
    >
      {_.map(routes, ({ label }: SettingPanelType, panelName) => (
        <SelectItem
          key={'/' + panelName}
          value={'/' + panelName}
          className={twMerge(
            'w-full !min-w-[13ch] text-base-content',
            panelName === selectedPanel && ' text-primary',
          )}
          classNames={{
            description: ' text',
          }}
        >
          {label}
        </SelectItem>
      ))}
    </Select>
  )
})

const SettingsModal = observer(() => {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const modalRef = useRef<HTMLDialogElement>(null)
  const isMobile = useMedia('(max-width: 768px)')

  const isOpen = pathname !== '/'
  const isSearching = pathname === '/search'

  const shouldShowBackButton = pathname !== '/initial' && isMobile

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.showModal()
    } else {
      modalRef.current?.close()
    }
  }, [isOpen])

  // if the panel name was changed outside of the router scope, we need to reset it
  useEffect(() => {
    if (pathname === '/initial' && !isMobile) {
      navigate('general', { replace: true })
    }
  }, [pathname, isMobile])

  // const history = useHistor

  // const handleMobileBackButtonClicked = useCallback(
  //   e => {
  //     e.preventDefault()

  //     navigate('/initial')
  //   },
  //   [pathname],
  // )

  return (
    <Modal
      backdrop="opaque"
      isOpen={isOpen}
      onClose={() => navigate('/')}
      size={isMobile ? 'full' : undefined}
      classNames={{
        base: twMerge(!isMobile && '!w-full max-w-full'),
        body: 'px-2 text-base-content overflow-hidden',
        backdrop:
          'bg-gradient-to-t from-base-200 from-25% to-base-200/20 backdrop-opacity-20 !cursor-pointer',
        closeButton: 'hover:bg-base-content/30 hover:text-base-content',
      }}
      hideCloseButton
    >
      <DaisyUiThemeProvider>
        <ModalContent className="bg-base-100">
          <div className="navbar flex h-auto min-h-0 max-w-full gap-1 text-base-content">
            {shouldShowBackButton && (
              <div className="ml-auto justify-end md:hidden">
                <button
                  className="btn btn-circle btn-ghost btn-sm !text-lg opacity-70"
                  onClick={() => navigate(-1)}
                >
                  <Back />
                </button>
              </div>
            )}

            <SettingSearchBar />

            {!isSearching && (
              <div className="ml-auto justify-end">
                <NavButton to="/" className="btn btn-circle btn-ghost btn-sm opacity-70 md:text-lg">
                  ✕
                </NavButton>
              </div>
            )}
          </div>

          <ModalBody className="p-0">
            <div className="flex h-full flex-col rounded-md bg-base-100 p-2 pt-0">
              <div className="flex h-full flex-grow-0 flex-col justify-stretch gap-2 overflow-y-scroll md:h-[700px] md:flex-row">
                <div
                  className="w-full md:w-[200px] md:min-w-[200px] md:max-w-[200px]"
                  role="complementary"
                >
                  <div className="flex w-full flex-col gap-2 rounded-md bg-base-200 md:h-full md:p-2 ">
                    {isMobile ? <MobileSettingsSidePanel /> : <SettingsSidePanel />}

                    <a
                      href="https://github.com/mrdjohnson/llm-x"
                      className="btn btn-outline btn-neutral mt-auto hidden fill-base-content stroke-base-content hover:fill-primary-content md:flex"
                      aria-label="LLM-X's Github"
                      target="__blank"
                    >
                      <Github />
                    </a>
                  </div>

                  <div className="divider mb-0 mt-2 md:hidden" />
                </div>

                <section className="flex h-full w-full flex-1 justify-stretch overflow-x-auto overflow-y-scroll">
                  <Routes>
                    {_.map(settingRoutesByName, ({ Component, label, ...rest }, key) => (
                      <Route
                        key={key}
                        path={key + '/*'}
                        element={
                          <Drawer label={label} path={'/' + key}>
                            <Component />
                          </Drawer>
                        }
                        {...rest}
                      />
                    ))}
                  </Routes>
                </section>
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </DaisyUiThemeProvider>
    </Modal>
  )
})

export default SettingsModal
