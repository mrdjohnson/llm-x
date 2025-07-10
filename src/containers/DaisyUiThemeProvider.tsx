import { useEffect, useMemo, type PropsWithChildren } from 'react'
import useMedia from 'use-media'

import { settingStore } from '~/core/setting/SettingStore'
import { resolveThemeAlias, systemThemeConfig } from '~/utils/themeConfig'

const DaisyUiThemeProvider = ({ children }: PropsWithChildren) => {
  const selectedTheme = settingStore.setting.theme
  const prefersDarkMode = useMedia('(prefers-color-scheme: dark)')

  const theme = useMemo(() => {
    if (selectedTheme === '_system') {
      const systemTheme = prefersDarkMode ? systemThemeConfig.dark : systemThemeConfig.light
      return resolveThemeAlias(systemTheme)
    } else {
      return resolveThemeAlias(selectedTheme)
    }
  }, [selectedTheme, prefersDarkMode])

  useEffect(() => {
    document.body.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <div className="contents" data-theme={theme}>
      {children}
    </div>
  )
}

export default DaisyUiThemeProvider
