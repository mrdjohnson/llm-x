import Dropzone from '~/containers/Dropzone'
import { SideBar } from '~/containers/SideBar'
import ChatBox from '~/containers/ChatBox'
import SettingsModal from '~/features/settings/containers/SettingsModal'
import Progresses from '~/features/progress/components/Progresses'

import Navbar from '~/components/Navbar'
import PwaReloadPrompt from '~/components/PwaReloadPrompt'
import OmniBar from '~/components/OmniBar'
import Lightbox from '~/features/lightbox/components/Lightbox'

function App() {
  return (
    <Dropzone>
      <div className="container drawer drawer-end mx-auto flex max-h-screen flex-col place-self-center p-3 text-base-content">
        <Navbar />

        <SettingsModal />

        <Lightbox />

        <PwaReloadPrompt />

        <OmniBar />

        <section className="drawer-content flex h-screen max-h-full w-full flex-grow flex-row gap-4 overflow-hidden text-xl">
          <aside className="hidden lg:block" role="complementary">
            <SideBar />
          </aside>

          <main className="h-full w-full flex-1 overflow-x-auto overflow-y-hidden">
            <ChatBox />
          </main>
        </section>

        <Progresses />
      </div>
    </Dropzone>
  )
}

export default App
