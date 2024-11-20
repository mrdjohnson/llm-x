import { observer } from 'mobx-react-lite'
import _ from 'lodash'
import { useNavigate } from 'react-router-dom'

import { ConnectionTypes } from '~/core/types'
import { connectionViewModelByType } from '~/core/connection/viewModels'
import { connectionStore } from '~/core/connection/ConnectionStore'

const NewConnectionPanel = observer(() => {
  const navigate = useNavigate()

  const addConnection = async (type: ConnectionTypes) => {
    const nextConnection = await connectionStore.addConnection(type)

    navigate('/models')

    // this lets the drawer close first....then opens it back up
    setTimeout(() => {
      navigate('/models/' + nextConnection.id)
    }, 300)
  }

  return (
    <div className="mx-auto mt-4 flex flex-col gap-4 *:text-center">
      <span>Select a connection type: </span>

      {_.map(connectionViewModelByType, getConnector => getConnector().getSnapshot()).map(
        ({ type, label }) => (
          <button
            key={type}
            onClick={() => addConnection(type)}
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
