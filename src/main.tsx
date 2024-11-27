import { initDb } from '~/utils/db'
import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { KBarProvider } from 'kbar'
import { NextUIProvider } from '@nextui-org/react'
import { MemoryRouter } from 'react-router-dom'

import App from '~/App'
import DaisyUiThemeProvider from '~/containers/DaisyUiThemeProvider'

import '~/index.css'

const errorPage = (
  <div className="flex h-screen w-screen place-content-center bg-slate-700 text-3xl text-black">
    Waiting for app to load, hard refresh may be needed
  </div>
)

// load the database before anything else
initDb().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <MemoryRouter initialEntries={['/']}>
        <NextUIProvider>
          <KBarProvider>
            <Suspense fallback={errorPage}>
              <DaisyUiThemeProvider>
                <App />
              </DaisyUiThemeProvider>
            </Suspense>
          </KBarProvider>
        </NextUIProvider>
      </MemoryRouter>
    </React.StrictMode>,
  )
})
