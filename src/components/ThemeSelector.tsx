import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'

import ChevronDown from '~/icons/ChevronDown'
import { settingStore } from '~/core/SettingStore'

const themes: Record<string, string> = {
  _system: 'System theme',
  dark: 'Dark',
  dracula: 'Dracula',
  garden: 'Light',
}

const ThemeSelector = observer(() => {
  const [isOpen, setIsOpen] = useState(false)
  const selectedTheme = settingStore.theme

  return (
    <div className="form-control">
      <div className="label pb-1 pt-0">
        <span className="label-text text-sm">Theme:</span>
      </div>

      <div
        className={'dropdown dropdown-bottom ' + (isOpen ? ' dropdown-open' : '')}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
      >
        <button role="button" className="btn btn-active w-full">
          {themes[selectedTheme]}

          <div
            className={
              'transition-transform duration-200 ease-in-out' + (isOpen ? ' rotate-180 ' : '')
            }
          >
            <ChevronDown />
          </div>
        </button>

        <ul className="dropdown-content z-[1] mt-1 w-full rounded-box bg-base-300 p-2 shadow-2xl">
          <label className="text-sm text-base-content/60">Select theme</label>

          {_.map(themes, (label, value) => (
            <li key={value}>
              <button
                className={
                  'btn btn-ghost btn-sm btn-block justify-start' +
                  (selectedTheme === value ? ' btn-active' : '')
                }
                aria-label={label}
                onClick={() => settingStore.setTheme(value)}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
})

export default ThemeSelector
