import { initDb } from '~/core/db'
import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { KBarProvider } from 'kbar'
import { MemoryRouter } from 'react-router-dom'
import { MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'

import App from '~/App'
import DaisyUiThemeProvider from '~/containers/DaisyUiThemeProvider'

import '~/index.css'
import StartupSpinner from '~/icons/StartupSpinner'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'

const errorPage = (
  <div className="flex h-screen w-screen items-center justify-center bg-base-100">
    <div className="flex flex-col items-center">
      <StartupSpinner />
      <span className="text-3xl text-white">Starting LLM X</span>
      <span className="mt-2 text-base text-gray-300">
        Try a hard refresh if this takes too long
      </span>
    </div>
  </div>
)

// load the database before anything else
initDb().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <MemoryRouter initialEntries={['/']}>
        <MantineProvider defaultColorScheme="dark">
          <ModalsProvider>
              <KBarProvider>
                <Suspense fallback={errorPage}>
                  <DaisyUiThemeProvider>
                    <App />
                  </DaisyUiThemeProvider>
                </Suspense>
              </KBarProvider>
          </ModalsProvider>
        </MantineProvider>
      </MemoryRouter>
    </React.StrictMode>,
  )
})
