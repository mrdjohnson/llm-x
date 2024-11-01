import { observer } from 'mobx-react-lite'
import { Listbox, ListboxItem } from '@nextui-org/listbox'
import _ from 'lodash'

import { connectionStore } from '~/core/connection/ConnectionStore'
import { connectionViewModelByType } from '~/core/connection/viewModels'

const NewConnectionPanel = observer(() => {
  return (
    <div className="mt-4 flex flex-col gap-4 *:text-center">
      <span>Select a connection type: </span>

      <Listbox>
        {_.map(connectionViewModelByType, connector => connector.getSnapshot()).map(
          ({ type, label }) => (
            <ListboxItem key={type} onClick={() => connectionStore.addConnection(type)}>
              {label}
            </ListboxItem>
          ),
        )}
      </Listbox>
    </div>
  )
})

export default NewConnectionPanel
