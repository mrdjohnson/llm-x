import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import useMedia from 'use-media'
import { useMemo } from 'react'

import ChevronDown from '../icons/ChevronDown'
import { settingStore } from '../models/SettingStore'

const themes: Record<string, string> = {
  _system: 'System theme',
  dark: 'Dark',
  dracula: 'Dracula',
  garden: 'Light',
}

const ThemeSelector = observer(() => {
  const selectedTheme = settingStore.theme
  const prefersDarkMode = useMedia('(prefers-color-scheme: dark)')

  const theme = useMemo(() => {
    if (selectedTheme !== '_system') return selectedTheme

    return prefersDarkMode ? 'dark' : 'garden'
  }, [selectedTheme, prefersDarkMode])

  return (
    <div className="form-control">
      <div className="label pb-1 pt-0">
        <span className="label-text text-sm">Theme:</span>
      </div>

      <div className="dropdown ">
        <div tabIndex={0} role="button" className="btn btn-active">
          {themes[selectedTheme]}
          <ChevronDown />
        </div>

        <ul
          tabIndex={0}
          className="dropdown-content z-[1] p-2 shadow-2xl bg-base-300 rounded-box w-52 mt-2"
        >
          {_.map(themes, (label, value) => (
            <li key={value}>
              <input
                type="radio"
                name="theme-dropdown"
                className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                aria-label={label}
                value={theme}
                checked={selectedTheme === value}
                onChange={() => settingStore.setTheme(value)}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
})

export default ThemeSelector
