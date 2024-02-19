import _ from 'lodash'
import { observer } from 'mobx-react-lite'

import { SideBar } from './components/SideBar'
import Drawer from './components/Drawer'
import ChatBox from './components/ChatBox'
import Modal from './components/Modal'

import { settingStore } from './models/SettingStore'

import Warning from './icons/Warning'
import Bars3 from './icons/Bars3'

// import './App.css'
import 'highlight.js/styles/github.css'

const Navbar = observer(() => {
  const noServer = !settingStore.selectedModel

  return (
    <nav className="navbar bg-base-300 rounded-md mb-2">
      <div className="flex-1 text-xl">
        <label className="ml-2 text-xl">LLM Explorer</label>
      </div>

      <div className="flex-none">
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
    <div className="App grid">
      <div className="flex flex-col max-h-screen p-3 drawer drawer-end place-self-center container">
        <Navbar />

        <Drawer />

        <Modal />

        <section className="flex flex-row gap-4 text-xl flex-grow max-h-full overflow-hidden h-screen drawer-content w-full">
          <aside className="h-full hidden lg:block">
            <SideBar />
          </aside>

          <main className=" h-full flex-1 w-full overflow-x-auto overflow-y-scroll">
            <ChatBox />
          </main>
        </section>
      </div>
    </div>
  )
}

export default App
