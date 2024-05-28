import { observer } from 'mobx-react-lite'
import { Listbox, ListboxItem } from '@nextui-org/listbox'
import _ from 'lodash'

import { connectionModelStore } from '~/features/connections/ConnectionModelStore'
import { serverConnectionByType } from '~/features/connections/servers'

const NewConnectionPanel = observer(() => {
  return (
    <div className="flex flex-col gap-4 mt-4 *:text-center">
      <span>Select a connection type: </span>

      <Listbox>
        {_.map(serverConnectionByType, connector => connector.getSnapshot()).map(({ type, label }) => (
          <ListboxItem key={type} onClick={() => connectionModelStore.addConnection(type)}>
            {label}
          </ListboxItem>
        ))}
      </Listbox>
    </div>
  )
})

export default NewConnectionPanel
