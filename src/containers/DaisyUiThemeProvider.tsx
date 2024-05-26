import { useEffect, useMemo, type PropsWithChildren } from 'react'
import { observer } from 'mobx-react-lite'
import useMedia from 'use-media'

import { settingStore } from '~/models/SettingStore'

const DaisyUiThemeProvider = observer(({ children }: PropsWithChildren) => {
  const selectedTheme = settingStore.theme
  const prefersDarkMode = useMedia('(prefers-color-scheme: dark)')

  const theme = useMemo(() => {
    if (selectedTheme !== '_system') return selectedTheme

    return prefersDarkMode ? 'dark' : 'garden'
  }, [selectedTheme, prefersDarkMode])

  useEffect(() => {
    document.body.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <div className="contents" data-theme={theme}>
      {children}
    </div>
  )
})

export default DaisyUiThemeProvider
