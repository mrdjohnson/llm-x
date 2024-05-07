import { observer } from 'mobx-react-lite'
import { useKBar } from 'kbar'

import ModelSelector from '~/components/ModelSelector'
import ModelRefreshButton from '~/components/ModelRefreshButton'
import FunTitle from '~/components/FunTitle'

import { settingStore } from '~/models/SettingStore'

import Warning from '~/icons/Warning'
import Bars3 from '~/icons/Bars3'
import CloudDown from '~/icons/CloudDown'
import Search from '~/icons/Search'
import AppSettings from '~/icons/AppSettings'

const Navbar = observer(() => {
  const { query } = useKBar()

  const noServer = !settingStore.isAnyServerConnected

  const handlePwaUpdate = () => {
    settingStore.getUpdateServiceWorker()?.()

    settingStore.setPwaNeedsUpdate(false)
  }

  return (
    <nav className="navbar mb-2 flex h-auto min-h-0 justify-between gap-4 rounded-md bg-base-300">
      <div className="ml-2 pr-2 text-sm md:text-xl">
        <h1 className="hidden">LLM-X</h1>
        <FunTitle className="md:text-xl" />
      </div>

      <div className="hidden flex-1 max-w-[600px] flex-row gap-2 md:flex">
        <ModelSelector />
        <ModelRefreshButton />
      </div>

      <div className="flex flex-row justify-end gap-2">
        {settingStore.pwaNeedsUpdate && (
          <button
            className="btn btn-square btn-ghost btn-sm md:btn-md"
            onClick={handlePwaUpdate}
            title="Update from cloud"
          >
            <CloudDown />
          </button>
        )}

        <button className="btn btn-square btn-ghost btn-md hidden md:flex" onClick={query.toggle}>
          <Search />
        </button>

        <label
          htmlFor="app-drawer"
          className="btn btn-square btn-ghost btn-sm md:btn-md "
          onClick={() => settingStore.openSettingsModal()}
        >
          <div className="indicator p-1">
            <div className="swap lg:swap-active">
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
        </label>
      </div>
    </nav>
  )
})

export default Navbar
