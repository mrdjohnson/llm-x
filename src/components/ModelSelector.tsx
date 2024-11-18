import { useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import _ from 'lodash'
import { useNavigate } from 'react-router-dom'

import ChevronDown from '~/icons/ChevronDown'
import { connectionStore } from '~/core/connection/ConnectionStore'

const ModelSelector = observer(() => {
  const navigate = useNavigate()

  const { selectedModelLabel, isAnyServerConnected, selectedConnection } = connectionStore
  const noServer = !isAnyServerConnected

  const label = useMemo(() => {
    if (noServer) {
      return 'No Servers connected'
    }

    if (selectedModelLabel) return selectedModelLabel

    if (!selectedConnection) return 'Add a connection here'

    if (_.isEmpty(selectedConnection.models)) {
      return `No ${selectedConnection.label} models available`
    }

    return `No ${selectedConnection.label} models selected`
  }, [noServer, selectedConnection?.models, selectedModelLabel])

  const handleClick = () => {
    if (!selectedConnection) {
      navigate('/models')
    } else {
      navigate('/models/' + selectedConnection.id)
    }
  }

  return (
    <button
      tabIndex={0}
      role="button"
      className="btn btn-active btn-sm flex-1 justify-items-start bg-base-100 text-left md:btn-md"
      disabled={noServer}
      onClick={handleClick}
    >
      <span className="flex w-full flex-row items-baseline justify-between gap-2 ">
        {label}
        <ChevronDown className="place-self-center" />
      </span>
    </button>
  )
})

export default ModelSelector
