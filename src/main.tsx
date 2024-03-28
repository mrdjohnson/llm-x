import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraBaseProvider } from '@chakra-ui/react'
import { KBarProvider } from 'kbar'

import App from '~/App'
import DaisyUiThemeProvider from '~/containers/DaisyUiThemeProvider'

import '~/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DaisyUiThemeProvider>
      <ChakraBaseProvider>
        <KBarProvider>
          <App />
        </KBarProvider>
      </ChakraBaseProvider>
    </DaisyUiThemeProvider>
  </React.StrictMode>,
)
