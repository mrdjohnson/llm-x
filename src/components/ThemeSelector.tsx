import { Select } from '@mantine/core'
import _ from 'lodash'

import { settingStore } from '~/core/setting/SettingStore'

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
        size="md"
        value={selectedTheme}
        data={_.map(themes, (label, value) => ({ value, label }))}
        label="Theme"
        onChange={theme => settingStore.update({ theme: theme as keyof typeof themes })}
        allowDeselect={false}
      />
    </div>
  )
}

export default ThemeSelector
