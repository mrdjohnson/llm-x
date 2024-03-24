import { observer } from 'mobx-react-lite'
import { useKBar } from 'kbar'

import ModelSelector from './ModelSelector'
import ModelRefreshButton from './ModelRefreshButton'
import FunTitle from './FunTitle'

import { settingStore } from '../models/SettingStore'

import Warning from '../icons/Warning'
import Bars3 from '../icons/Bars3'
import CloudDown from '../icons/CloudDown'
import Search from '../icons/Search'

const Navbar = observer(() => {
  const { query } = useKBar()

  const noServer = !settingStore.isServerConnected

  const handlePwaUpdate = () => {
    settingStore.getUpdateServiceWorker()?.()

    settingStore.setPwaNeedsUpdate(false)
  }

  return (
    <nav className="navbar mb-2 flex justify-between rounded-md bg-base-300">
      <div className="ml-2 flex-1 text-xl">
        <h1 className="hidden">LLM-X</h1>
        <FunTitle className="text-xl" />
      </div>

      <div className="hidden flex-1 flex-row gap-2 md:flex">
        <ModelSelector />
        <ModelRefreshButton />
      </div>

      <div className="flex flex-1 flex-row justify-end gap-2">
        {settingStore.pwaNeedsUpdate && (
          <button
            className="btn btn-square btn-ghost"
            onClick={handlePwaUpdate}
            title="Update from cloud"
          >
            <CloudDown />
          </button>
        )}

        <button className="btn btn-square btn-ghost" onClick={query.toggle}>
          <Search />
        </button>

        <label htmlFor="app-drawer" className="btn btn-square btn-ghost drawer-button ">
          <div className="indicator p-1">
            <Bars3 />

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
