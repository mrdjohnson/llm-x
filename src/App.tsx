import React, { Suspense } from 'react'
import { observer } from 'mobx-react-lite'

import Dropzone from '~/containers/Dropzone'

import Lightbox from '~/features/lightbox/components/Lightbox'

import { settingStore } from '~/core/setting/SettingStore'

const PwaReloadPrompt = React.lazy(() => import('~/components/LazyPwaReloadPrompt'))
const LazySettingsModal = React.lazy(() => import('~/features/settings/containers/SettingsModal'))
const LazyOmnibar = React.lazy(() => import('~/components/OmniBar'))
const LazySidebar = React.lazy(() => import('~/containers/SideBar'))
const LazyNavbar = React.lazy(() => import('~/components/Navbar'))
const LazyChatBox = React.lazy(() => import('~/containers/ChatBox'))
const LazyProgresses = React.lazy(() => import('~/features/progress/components/Progresses'))

const DelayedPwaReloadPrompt = () => {
  if (__TARGET__ !== 'pwa') return null

  return (
    <Suspense fallback={null}>
      <PwaReloadPrompt />
    </Suspense>
  )
}

const App = observer(() => {
  if (!settingStore.setting) {
    throw new Error('waiting for app to load')
  }

  return (
    <Dropzone>
      <div className="drawer drawer-end mx-auto flex !h-dvh !max-h-dvh flex-col place-self-center text-base-content">
        <div className="md:hidden">
          <Suspense fallback={null}>
            <LazyNavbar />
          </Suspense>
        </div>

        <Suspense fallback={null}>
          <LazySettingsModal />
        </Suspense>

        <Lightbox />

        <DelayedPwaReloadPrompt />

        <Suspense fallback={null}>
          <LazyOmnibar />
        </Suspense>

        <section className="drawer-content flex h-full max-h-full w-full flex-row gap-4 overflow-hidden text-xl">
          <aside className="hidden md:block" role="complementary">
            <Suspense fallback={null}>
              <LazySidebar />
            </Suspense>
          </aside>

          <main className="mx-auto flex h-full max-w-4xl flex-1 overflow-x-hidden overflow-y-hidden rounded-md p-3 pt-0 md:pt-3">
            <Suspense fallback={null}>
              <LazyChatBox />
            </Suspense>
          </main>
        </section>

        <LazyProgresses />
      </div>
    </Dropzone>
  )
})

export default App
