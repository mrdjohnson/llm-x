import { useMemo } from 'react'
import { observer } from 'mobx-react-lite'

import ChevronDown from '~/icons/ChevronDown'
import { settingStore } from '~/models/SettingStore'

const ModelSelector = observer(() => {
  const {
    selectedModelLabel,
    isAnyServerConnected,
    isA1111ServerConnected,
    isServerConnected,
    isImageGenerationMode,
  } = settingStore
  const noServer = !isAnyServerConnected

  const label = useMemo(() => {
    if (noServer) {
      return 'No Servers connected'
    }

    if (!isA1111ServerConnected && isImageGenerationMode) {
      return 'No a1111 models available'
    }

    if (!isServerConnected) {
      return 'No models available'
    }

    return selectedModelLabel
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
