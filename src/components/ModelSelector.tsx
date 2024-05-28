import { useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import _ from 'lodash'

import ChevronDown from '~/icons/ChevronDown'
import { settingStore } from '~/models/SettingStore'
import { connectionModelStore } from '~/features/connections/ConnectionModelStore'

const ModelSelector = observer(() => {
  const { selectedModelLabel, isAnyServerConnected, selectedConnection } = connectionModelStore
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
      settingStore.openSettingsModal('general')
    } else {
      settingStore.openSettingsModal('models')
    }
  }

  return (
    <button
      tabIndex={0}
      role="button"
      className="btn btn-active flex-1"
      disabled={noServer}
      onClick={handleClick}
    >
      {label}
      <ChevronDown />
    </button>
  )
})

export default ModelSelector
