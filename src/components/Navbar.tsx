import { useKBar } from 'kbar'
import { Input, Kbd, TooltipProps } from '@nextui-org/react'
import { observer } from 'mobx-react-lite'
import { NavLink } from 'react-router-dom'

import ModelSelector from '~/components/ModelSelector'
import ModelRefreshButton from '~/components/ModelRefreshButton'
import FunTitle from '~/components/FunTitle'
import ToolTip from '~/components/Tooltip'
import { NavButton } from '~/components/NavButton'

import Warning from '~/icons/Warning'
import Bars3 from '~/icons/Bars3'
import Search from '~/icons/Search'
import AppSettings from '~/icons/AppSettings'
import ChevronDown from '~/icons/ChevronDown'
import ShrinkHorizontal from '~/icons/ShrinkHorizontal'

import { connectionStore } from '~/core/connection/ConnectionStore'
import { personaStore } from '~/core/persona/PersonaStore'
import { settingStore } from '~/core/setting/SettingStore'

const KeyboardTooltip = ({
  command,
  ...rest
}: Omit<TooltipProps, 'label'> & { command: string }) => (
  <ToolTip
    label={
      <Kbd keys={['command']} className="border-none bg-transparent text-base-content shadow-none">
        {command}
      </Kbd>
    }
    {...rest}
  />
)

const Navbar = observer(() => {
  const { query } = useKBar()

  const noServer = !connectionStore.isAnyServerConnected

  // const handlePwaUpdate = () => {
  //   settingStore.getUpdateServiceWorker()?.()

  //   settingStore.setPwaNeedsUpdate(false)
  // }

  return (
    <div className="navbar mb-2 flex h-auto min-h-0 flex-row justify-between gap-3 bg-base-300 p-1 md:mb-0 md:flex-col md:p-0">
      <div className="ml-2 hidden items-center pr-2 md:flex md:text-xl">
        <button
          className="absolute left-2 text-base-content/30 transition-colors duration-100 ease-in-out hover:text-base-content/80"
          onClick={() =>
            settingStore.update({ isSidebarOpen: !settingStore.setting.isSidebarOpen })
          }
        >
          <ShrinkHorizontal />
        </button>

        <FunTitle className="md:text-xl" />
      </div>

      <div className="w-fit max-w-[600px] flex-row gap-2 md:flex md:w-full md:flex-1">
        <ModelSelector />
        <ModelRefreshButton />
      </div>

      <NavButton
        tabIndex={0}
        to="/personas"
        disabled={connectionStore.isImageGenerationMode}
        className="hidden w-full md:block"
      >
        <Input
          isReadOnly
          label={personaStore.selectedPersona && 'Persona'}
          variant="bordered"
          value={personaStore.selectedPersona?.name || 'No persona selected'}
          className="w-full !cursor-pointer"
          classNames={{
            inputWrapper:
              'btn !cursor-pointer border-base-content/20 rounded-md hover:!border-base-content/30 p-2 pr-1',
            input: '!cursor-pointer',
            label: '!cursor-pointer',
            innerWrapper: '!cursor-pointer',
          }}
          endContent={
            <ChevronDown className="-rotate-90 place-self-center !stroke-[3px]  text-base-content/45" />
          }
        />
      </NavButton>

      <div className="flex flex-row justify-end gap-2">
        {/* {settingStore.pwaNeedsUpdate && (
          <button
            className="btn btn-square btn-ghost btn-sm md:btn-md"
            onClick={handlePwaUpdate}
            title="Update from cloud"
          >
            <CloudDown />
          </button>
        )} */}

        <KeyboardTooltip command="K" placement="left" showArrow={false}>
          <button
            className="btn btn-square btn-ghost btn-md hidden !bg-transparent text-base-content/60 hover:text-base-content md:flex"
            onClick={query.toggle}
          >
            <Search />
          </button>
        </KeyboardTooltip>

        <KeyboardTooltip command="/" placement="right" showArrow={false}>
          <NavLink
            to="initial"
            className="btn btn-square btn-ghost btn-sm min-w-0 !bg-transparent text-base-content/60 md:btn-md hover:text-base-content"
          >
            <div className="indicator p-1">
              <div className="swap md:swap-active">
                <div className="swap-on align-middle">
                  <AppSettings />
                </div>

                <div className="swap-off">
                  <Bars3 />
                </div>
              </div>

              {noServer && (
                <span className="indicator-item">
                  <Warning />
                </span>
              )}
            </div>
          </NavLink>
        </KeyboardTooltip>
      </div>
    </div>
  )
})

export default Navbar
