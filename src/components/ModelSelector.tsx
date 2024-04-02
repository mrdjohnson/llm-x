import { useMemo } from 'react'
import { observer } from 'mobx-react-lite'

import ChevronDown from '~/icons/ChevronDown'
import { settingStore } from '~/models/SettingStore'

const ModelSelector = observer(() => {
  const { selectedModelLabel, isAnyServerConnected } = settingStore
  const noServer = !isAnyServerConnected

  const label = useMemo(() => {
    if (noServer) {
      return 'Server not connected'
    }

    return selectedModelLabel || 'No models available'
  }, [noServer, selectedModelLabel])

  return (
    <button
      tabIndex={0}
      role="button"
      className="btn btn-active flex-1"
      disabled={noServer}
      onClick={() => settingStore.openSettingsModal('models')}
    >
      {label}
      <ChevronDown />
    </button>
  )
})

export default ModelSelector
