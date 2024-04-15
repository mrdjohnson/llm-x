import React from 'react'
import ReactDOM from 'react-dom/client'
import { KBarProvider } from 'kbar'

import App from '~/App'
import DaisyUiThemeProvider from '~/containers/DaisyUiThemeProvider'

import '~/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DaisyUiThemeProvider>
      <KBarProvider>
        <App />
      </KBarProvider>
    </DaisyUiThemeProvider>
  </React.StrictMode>,
)
