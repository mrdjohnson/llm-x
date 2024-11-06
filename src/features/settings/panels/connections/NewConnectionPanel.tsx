import { observer } from 'mobx-react-lite'
import _ from 'lodash'

import { connectionViewModelByType } from '~/core/connection/viewModels'
import { connectionStore } from '~/core/connection/ConnectionStore'

const NewConnectionPanel = observer(() => {
  return (
    <div className="mx-auto mt-4 flex flex-col gap-4 *:text-center">
      <span>Select a connection type: </span>

      {_.map(connectionViewModelByType, getConnector => getConnector().getSnapshot()).map(
        ({ type, label }) => (
          <button
            key={type}
            onClick={() => connectionStore.addConnection(type)}
            className="btn btn-outline btn-secondary w-fit place-self-center border-0"
          >
            {label}
          </button>
        ),
      )}
    </div>
  )
})

export default NewConnectionPanel
