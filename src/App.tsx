import React, { Suspense } from 'react'

import Dropzone from '~/containers/Dropzone'
import { SideBar } from '~/containers/SideBar'
import ChatBox from '~/containers/ChatBox'
import SettingsModal from '~/features/settings/containers/SettingsModal'
import Progresses from '~/features/progress/components/Progresses'

import Navbar from '~/components/Navbar'
import OmniBar from '~/components/OmniBar'
import Lightbox from '~/features/lightbox/components/Lightbox'

const PwaReloadPrompt = React.lazy(() => import('~/components/LazyPwaReloadPrompt'))

const DelayedPwaReloadPrompt = () => {
  if (__TARGET__ !== 'pwa') return null

  return (
    <Suspense fallback={null}>
      <PwaReloadPrompt />
    </Suspense>
  )
}

function App() {
  return (
    <Dropzone>
      <div className="drawer drawer-end mx-auto flex !h-dvh !max-h-dvh flex-col place-self-center text-base-content">
        <div className="md:hidden">
          <Navbar />
        </div>

        <SettingsModal />

        <Lightbox />

        <DelayedPwaReloadPrompt />

        <OmniBar />

        <section className="drawer-content flex h-full max-h-full w-full flex-row gap-4 overflow-hidden text-xl">
          <aside className="hidden md:block" role="complementary">
            <SideBar />
          </aside>

          <main className="mx-auto flex h-full max-w-4xl flex-1 overflow-x-hidden overflow-y-hidden rounded-md p-3">
            <ChatBox />
          </main>
        </section>

        <Progresses />
      </div>
    </Dropzone>
  )
}

export default App
