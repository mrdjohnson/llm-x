import React, { Suspense } from 'react'
import { Notifications } from '@mantine/notifications'
import { AppShell } from '@mantine/core'

import Dropzone from '~/containers/Dropzone'

import Lightbox from '~/features/lightbox/components/Lightbox'

import { settingStore } from '~/core/setting/SettingStore'

import usePwaReloader from '~/utils/hooks/useReloader.platform'

const LazySettingsModal = React.lazy(() => import('~/features/settings/containers/SettingsModal'))
const LazyOmnibar = React.lazy(() => import('~/components/OmniBar'))
const LazySidebar = React.lazy(() => import('~/containers/SideBar'))
const LazyNavbar = React.lazy(() => import('~/components/Navbar'))
const LazyChatBox = React.lazy(() => import('~/containers/ChatBox'))
const LazyProgresses = React.lazy(() => import('~/features/progress/components/Progresses'))

const App = () => {
  if (!settingStore.setting) {
    throw new Error('waiting for app to load')
  }

  usePwaReloader()

  return (
    <Dropzone>
      <Notifications limit={10} />

      <div className="mx-auto flex flex-col place-self-center text-base-content">
        <div className="md:hidden">
          <Suspense fallback={null}>
            <LazyNavbar />
          </Suspense>
        </div>

        <Suspense fallback={null}>
          <LazySettingsModal />
        </Suspense>

        <Lightbox />

        <Suspense fallback={null}>
          <LazyOmnibar />
        </Suspense>

        <section className="flex h-full flex-1 flex-row gap-4 text-xl">
          <aside className="hidden md:block" role="complementary">
            <AppShell.Navbar className="!transition-[width] duration-300 ease-in-out">
              <LazySidebar />
            </AppShell.Navbar>
          </aside>

          <AppShell.Main className="mx-auto flex max-w-4xl md:pt-3">
            <Suspense fallback={null}>
              <LazyChatBox />
            </Suspense>
          </AppShell.Main>
        </section>

        <LazyProgresses />
      </div>
    </Dropzone>
  )
}

export default App
