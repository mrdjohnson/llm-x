import { initDb } from '~/utils/db'
import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { KBarProvider } from 'kbar'
import { NextUIProvider } from '@nextui-org/react'

import App from '~/App'
import DaisyUiThemeProvider from '~/containers/DaisyUiThemeProvider'

import '~/index.css'

// load the database before anything else
initDb().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Suspense fallback={<div />}>
        <NextUIProvider>
          <DaisyUiThemeProvider>
            <KBarProvider>
              <App />
            </KBarProvider>
          </DaisyUiThemeProvider>
        </NextUIProvider>
      </Suspense>
    </React.StrictMode>,
  )
})
