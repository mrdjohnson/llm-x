import { observer } from 'mobx-react-lite'
import { useKBar } from 'kbar'

import Dropzone from './containers/Dropzone'
import { SideBar } from './containers/SideBar'
import Drawer from './containers/Drawer'
import ChatBox from './containers/ChatBox'

import HelpModal from './components/HelpModal'
import ToastCenter from './components/ToastCenter'
import PwaReloadPrompt from './components/PwaReloadPrompt'
import ModelSelector from './components/ModelSelector'
import ModelRefreshButton from './components/ModelRefreshButton'
import ModelSelectionModal from './components/ModelSelectionModal'
import PersonaSelectionModal from './components/PersonaSelectionModal'
import FunTitle from './components/FunTitle'
import OmniBar from './components/OmniBar'

import { settingStore } from './models/SettingStore'

import Warning from './icons/Warning'
import Bars3 from './icons/Bars3'
import CloudDown from './icons/CloudDown'
import Search from './icons/Search'

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

function App() {
  return (
    <Dropzone>
      <div className="container drawer drawer-end mx-auto flex max-h-screen flex-col place-self-center p-3 text-base-content">
        <Navbar />

        <Drawer />

        <HelpModal />

        <ModelSelectionModal />

        <PersonaSelectionModal />

        <ToastCenter />

        <PwaReloadPrompt />

        <OmniBar />

        <section className="drawer-content flex h-screen max-h-full w-full flex-grow flex-row gap-4 overflow-hidden text-xl">
          <aside className="hidden h-full lg:block" role="complementary">
            <SideBar />
          </aside>

          <main className="h-full w-full flex-1 overflow-x-auto overflow-y-hidden">
            <ChatBox />
          </main>
        </section>
      </div>
    </Dropzone>
  )
}

export default App
