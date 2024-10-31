import React from 'react'
import ReactDOM from 'react-dom/client'
import { KBarProvider } from 'kbar'
import { NextUIProvider } from '@nextui-org/react'

import App from '~/App'
import DaisyUiThemeProvider from '~/containers/DaisyUiThemeProvider'

// we do not need to USE the root store, but in order to have messages in different branches:
// they need to be connected to a common source.
import '~/core/RootStore'

import '~/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <NextUIProvider>
      <DaisyUiThemeProvider>
        <KBarProvider>
          <App />
        </KBarProvider>
      </DaisyUiThemeProvider>
    </NextUIProvider>
  </React.StrictMode>,
)
