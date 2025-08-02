import { useEffect, useMemo, useRef } from 'react'
import _ from 'lodash'
import useMedia from 'use-media'
import { NavLink as RouterLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Modal, NavLink, Select } from '@mantine/core'

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

const SettingsSidePanel = ({
  onSectionClick,
}: {
  onSectionClick?: (panelName: SettingPanelOptionsType) => void
}) => {
  return _.map(
    settingRoutesByName,
    ({ mobileOnly, label, hidden }: SettingPanelType, panelName: SettingPanelOptionsType) => {
      if (mobileOnly || !label) return <div key={panelName} />
      if (hidden) return null

      return (
        <RouterLink to={panelName}>
          {({ isActive }) => (
            <NavLink
              key={panelName}
              className="rounded-md"
              onClick={() => onSectionClick?.(panelName)}
              role="link"
              active={isActive}
              label={label}
            />
          )}
        </RouterLink>
      )
    },
  )
}

const MobileSettingsSidePanel = () => {
  const navigate = useNavigate()
  const { pathname: selectedPanel } = useLocation()

  const goToSection = (path: string) => {
    //  reset the route to initial first
    navigate('/initial', { replace: true })

    navigate(path)
  }

  const routes = useMemo(() => {
    return _.chain(settingRoutesByName)
      .omitBy({ hidden: true })
      .map((value, key) => ({
        value: '/' + key,
        label: value!.label,
      }))
      .value()
  }, [])

  if (selectedPanel === '/search') return null

  return (
    <Select
      value={selectedPanel}
      size="md"
      label="Section"
      onChange={(_value, option) => goToSection(option.value)}
      data={routes}
    />
  )
}

const SettingsModal = () => {
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

  const title = (
    <DaisyUiThemeProvider>
      <div className="navbar flex h-auto min-h-0 w-full max-w-full gap-1 p-0 text-base-content">
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
    </DaisyUiThemeProvider>
  )

  return (
    <Modal
      opened={isOpen}
      onClose={() => navigate('/')}
      size={'100%'}
      className="w-full max-w-[1200px]"
      classNames={{
        body: 'px-2 text-base-content overflow-hidden rounded-md',
        overlay:
          'bg-gradient-to-t from-base-200 from-25% to-base-200/20 backdrop-opacity-20 !cursor-pointer',
        close: 'hover:bg-base-content/30 hover:text-base-content',
        title: 'w-full',
      }}
      fullScreen={isMobile}
      withCloseButton={false}
      title={title}
      centered
    >
      <DaisyUiThemeProvider>
        <div className="flex h-full flex-grow-0 flex-col justify-stretch gap-2 overflow-y-scroll md:h-[700px] md:flex-row">
          <div
            className="w-full rounded-lg bg-black/10 p-2 md:w-[200px] md:min-w-[200px] md:max-w-[200px]"
            role="complementary"
          >
            <div className="flex w-full flex-col gap-2 rounded-md md:h-full">
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
      </DaisyUiThemeProvider>
    </Modal>
  )
}

export default SettingsModal
