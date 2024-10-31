import { useEffect, useMemo, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import _ from 'lodash'
import useMedia from 'use-media'
import { Modal, ModalContent, ModalBody } from '@nextui-org/react'
import { useKBar } from 'kbar'

import { settingStore } from '~/core/SettingStore'

import DaisyUiThemeProvider from '~/containers/DaisyUiThemeProvider'

import Github from '~/icons/Github'
import Back from '~/icons/Back'

import {
  SettingPanelOptionsType,
  SettingPanelType,
  settingsPanelByName,
} from '~/features/settings/settingsPanels'

const SettingsSidePanel = ({
  selectedPanel,
  onSectionClick,
}: {
  selectedPanel?: SettingPanelOptionsType
  onSectionClick?: (panelName: SettingPanelOptionsType) => void
}) => {
  const handleSectionClick = (panelName: SettingPanelOptionsType) => {
    // clicking on self or other will open other
    onSectionClick?.(panelName)
    settingStore.openSettingsModal(panelName)
  }

  return _.map(
    settingsPanelByName,
    ({ mobileOnly, label }: SettingPanelType, panelName: SettingPanelOptionsType) => {
      if (mobileOnly || !label) return <div key={panelName} />

      return (
        <button
          key={panelName}
          className={
            'btn w-full justify-start ' + (panelName === selectedPanel ? ' btn-neutral' : '')
          }
          onClick={() => handleSectionClick(panelName)}
        >
          {label}
        </button>
      )
    },
  )
}

const MobileSettingsSidePanel = observer(
  ({ selectedPanel }: { selectedPanel?: SettingPanelOptionsType }) => {
    const containerRef = useRef<HTMLDetailsElement>(null)

    const handleSectionClick = (panelName: SettingPanelOptionsType) => {
      settingStore.openSettingsModal(panelName)

      containerRef.current?.removeAttribute('open')
    }

    if (!selectedPanel || !settingsPanelByName[selectedPanel]) return null

    return (
      <details className="dropdown w-full" ref={containerRef}>
        <summary role="button" className="btn w-full lg:hidden">
          Go to section
        </summary>

        <ul className="menu dropdown-content z-50 mt-1 w-full rounded-box bg-base-200 p-2 lg:p-0">
          <SettingsSidePanel selectedPanel={selectedPanel} onSectionClick={handleSectionClick} />
        </ul>
      </details>
    )
  },
)

const SettingsModal = observer(() => {
  const modalRef = useRef<HTMLDialogElement>(null)
  const isMobile = useMedia('(max-width: 1024px)')
  const { query } = useKBar()

  let panelName = settingStore.settingsPanelName
  if (panelName === 'initial' && !isMobile) {
    panelName = 'general'
  }

  const { subtitle, Component } = useMemo<Partial<SettingPanelType>>(() => {
    if (!panelName) return {}

    return settingsPanelByName[panelName]
  }, [panelName, isMobile])

  const isOpen = !!Component

  const handleClose = () => {
    settingStore.closeSettingsModal()
  }

  const shouldShowBackButton = panelName !== 'initial' && isMobile

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.showModal()
      query.disable(true)
    } else {
      modalRef.current?.close()
      query.disable(false)
    }
  }, [isOpen])

  return (
    <Modal
      backdrop="opaque"
      isOpen={isOpen}
      onClose={handleClose}
      size={isMobile ? 'full' : undefined}
      classNames={{
        base: isMobile ? '' : '!container',
        body: 'px-2 text-base-content overflow-hidden',
        backdrop:
          'bg-gradient-to-t from-base-200 from-25% to-base-200/20 backdrop-opacity-20 !cursor-pointer',
        closeButton: 'hover:bg-base-content/30 hover:text-base-content',
      }}
      hideCloseButton
    >
      <DaisyUiThemeProvider>
        <ModalContent className="bg-base-100">
          <div className="navbar flex h-auto min-h-0 max-w-full text-base-content">
            <div className="ml-auto justify-end">
              <button
                className={
                  'btn btn-circle btn-ghost btn-sm !text-lg opacity-70 ' +
                  (shouldShowBackButton ? '' : ' pointer-events-none !opacity-0') // hack to hide the button but keep spacing
                }
                onClick={() => settingStore.openSettingsModal('initial')}
              >
                <Back />
              </button>
            </div>

            <div className="w-full flex-1 justify-center font-semibold lg:text-xl">
              Settings{subtitle && `: ${subtitle}`}
            </div>

            <div className="ml-auto justify-end">
              <button
                className="btn btn-circle btn-ghost btn-sm opacity-70 lg:text-lg"
                onClick={handleClose}
              >
                ✕
              </button>
            </div>
          </div>

          <ModalBody className="pt-0">
            <div className="flex h-full flex-col rounded-md bg-base-100 p-2 pt-0">
              <div className="flex h-full flex-grow-0 flex-col justify-stretch gap-2 overflow-y-scroll lg:h-[700px] lg:flex-row">
                <div
                  className="w-full lg:w-[260px] lg:min-w-[260px] lg:max-w-[260px]"
                  role="complementary"
                >
                  <div className="flex w-full flex-col gap-2 rounded-md bg-base-200 lg:h-full lg:p-2 ">
                    {isMobile ? (
                      <MobileSettingsSidePanel selectedPanel={panelName} />
                    ) : (
                      <SettingsSidePanel selectedPanel={panelName} />
                    )}

                    <a
                      href="https://github.com/mrdjohnson/llm-x"
                      className="btn btn-outline btn-neutral mt-auto hidden fill-base-content stroke-base-content hover:fill-primary-content lg:flex"
                      aria-label="LLM-X's Github"
                      target="__blank"
                    >
                      <Github />
                    </a>
                  </div>

                  <div className="divider mb-0 mt-2 lg:hidden" />
                </div>

                <section className="flex h-full w-full flex-1 justify-stretch overflow-x-auto overflow-y-scroll">
                  {Component && <Component />}
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
