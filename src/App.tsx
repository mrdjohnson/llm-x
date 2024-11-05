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
      <div className="container drawer drawer-end mx-auto flex !h-dvh !max-h-dvh flex-col place-self-center p-3 text-base-content">
        <Navbar />

        <SettingsModal />

        <Lightbox />

        <DelayedPwaReloadPrompt />

        <OmniBar />

        <section className="drawer-content flex h-full max-h-full w-full flex-grow flex-row gap-4 overflow-hidden text-xl">
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
