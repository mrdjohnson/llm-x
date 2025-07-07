import { initDb } from '~/core/db'
import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { KBarProvider } from 'kbar'
import { HeroUIProvider } from "@heroui/react"
import { MemoryRouter } from 'react-router-dom'

import App from '~/App'
import DaisyUiThemeProvider from '~/containers/DaisyUiThemeProvider'

import '~/index.css'

const errorPage = (
  <div className="flex h-screen w-screen items-center justify-center bg-slate-700">
    <div className="flex flex-col items-center">
      <svg
        className="animate-spin h-12 w-12 text-white mb-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        ></path>
      </svg>
      <span className="text-3xl text-white">Starting LLM X</span>
      <span className="text-base text-gray-300 mt-2">Try a hard refresh if this takes too long</span>
    </div>
  </div>)

// load the database before anything else
initDb().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <MemoryRouter initialEntries={['/']}>
        <HeroUIProvider>
          <KBarProvider>
            <Suspense fallback={errorPage}>
              <DaisyUiThemeProvider>
                <App />
              </DaisyUiThemeProvider>
            </Suspense>
          </KBarProvider>
        </HeroUIProvider>
      </MemoryRouter>
    </React.StrictMode>,
  )
})
