import { observer } from 'mobx-react-lite'
import { Listbox, ListboxItem } from '@nextui-org/listbox'
import _ from 'lodash'

import { connectionModelStore } from '~/features/connections/ConnectionModelStore'
import { serverConnectionByType } from '~/features/connections/servers'

import { settingStore } from '~/models/SettingStore'

const NewConnectionPanel = observer(() => {
  return (
    <div className="mx-auto mt-4 flex flex-col gap-4 *:text-center">
      <span>Select a connection type to add: </span>

      <Listbox>
        {_.map(serverConnectionByType, connector => connector.getSnapshot()).map(
          ({ type, label }) => (
            <ListboxItem
              key={type}
              onClick={() => {
                connectionModelStore.addConnection(type)
                settingStore.openSettingsModal('connections')
              }}
            >
              {label}
            </ListboxItem>
          ),
        )}
      </Listbox>
    </div>
  )
})

export default NewConnectionPanel
