import Dropzone from '~/containers/Dropzone'
import { SideBar } from '~/containers/SideBar'
import Drawer from '~/containers/Drawer'
import ChatBox from '~/containers/ChatBox'

import Navbar from '~/components/Navbar'
import HelpModal from '~/components/HelpModal'
import ToastCenter from '~/components/ToastCenter'
import PwaReloadPrompt from '~/components/PwaReloadPrompt'
import ModelSelectionModal from '~/components/ModelSelectionModal'
import PersonaSelectionModal from '~/components/PersonaSelectionModal'
import OmniBar from '~/components/OmniBar'

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
