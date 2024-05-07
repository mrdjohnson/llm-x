import { useMemo } from 'react'
import { observer } from 'mobx-react-lite'

import ChevronDown from '~/icons/ChevronDown'
import { settingStore } from '~/models/SettingStore'

const ModelSelector = observer(() => {
  const {
    selectedModelLabel,
    isAnyServerConnected,
    modelType,
  } = settingStore
  const noServer = !isAnyServerConnected

  const label = useMemo(() => {
    if (noServer) {
      return 'No Servers connected'
    }

    if(selectedModelLabel) return selectedModelLabel

    if (modelType === 'A1111' ) {
      return 'No A1111 models available'
    }

    if (modelType === 'LMS') {
      return 'No Lm studio models available'
    }

    return 'No Ollama models available'
  }, [noServer, modelType, selectedModelLabel])

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
