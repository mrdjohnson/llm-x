import _ from 'lodash'
import { observer } from 'mobx-react-lite'

import { SideBar } from './components/SideBar'
import Drawer from './components/Drawer'
import ChatBox from './components/ChatBox'
import HelpModal from './components/HelpModal'
import ToastCenter from './components/ToastCenter'
import PwaReloadPrompt from './components/PwaReloadPrompt'
import ModalSelector from './components/ModalSelector'
import ModelRefreshButton from './components/ModelRefreshButton'

import { settingStore } from './models/SettingStore'

import Warning from './icons/Warning'
import Bars3 from './icons/Bars3'

import 'highlight.js/styles/github.css'

const Navbar = observer(() => {
  const noServer = !settingStore.selectedModel

  return (
    <nav className="navbar mb-2 rounded-md bg-base-300">
      <div className="navbar-start text-xl">
        <label className="ml-2 text-xl">LLM X</label>
      </div>

      <div className="navbar-center flex flex-row gap-2">
        <ModalSelector />
        <ModelRefreshButton />
      </div>

      <div className="navbar-end">
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
    <div className="h-dvh grid">
      <div className="container drawer drawer-end flex max-h-screen flex-col place-self-center p-3">
        <Navbar />

        <Drawer />

        <HelpModal />

        <ToastCenter />

        <PwaReloadPrompt />

        <section className="drawer-content flex h-screen max-h-full w-full flex-grow flex-row gap-4 overflow-hidden text-xl">
          <aside className="hidden h-full lg:block">
            <SideBar />
          </aside>

          <main className="h-full w-full flex-1 overflow-x-auto overflow-y-hidden">
            <ChatBox />
          </main>
        </section>
      </div>
    </div>
  )
}

export default App
