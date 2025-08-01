import _ from 'lodash'
import { twMerge } from 'tailwind-merge'

import { settingStore } from '~/core/setting/SettingStore'
import { Select, SelectItem } from '@heroui/react'

const themes = {
  _system: 'System theme',
  dark: 'Dark',
  dracula: 'Dracula',
  garden: 'Light',
  synthwave: 'Synthwave',
  nord: 'Nord',
}

const ThemeSelector = () => {
  const selectedTheme = settingStore.setting.theme

  return (
    <div className="form-control">
      <Select
        className="w-full min-w-[20ch] rounded-md border border-base-content/30 bg-transparent"
        size="sm"
        classNames={{
          value: '!text-base-content min-w-[20ch]',
          trigger: 'bg-base-100 hover:!bg-base-200 rounded-md',
          popoverContent: 'text-base-content bg-base-100',
        }}
        selectedKeys={[selectedTheme]}
        label="Theme"
        onChange={selection =>
          settingStore.update({ theme: selection.target.value as keyof typeof themes })
        }
      >
        {_.map(themes, (value, key) => (
          <SelectItem
            key={key}
            value={key}
            className={twMerge(
              'w-full !min-w-[13ch] text-base-content',
              key === selectedTheme && 'text-primary',
            )}
            classNames={{
              description: ' text',
            }}
          >
            {value}
          </SelectItem>
        ))}
      </Select>
    </div>
  )
}

export default ThemeSelector
