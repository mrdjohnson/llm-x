import { useMemo } from 'react'
import { observer } from 'mobx-react-lite'

import ChevronDown from '../icons/ChevronDown'
import { settingStore } from '../models/SettingStore'

const ModelSelector = observer(() => {
  const { selectedModel, isServerConnected } = settingStore
  const noServer = !isServerConnected

  const label = useMemo(() => {
    if (!isServerConnected) {
      return 'Server not connected'
    }

    if (selectedModel?.name) {
      return selectedModel.name
    }

    return 'No models available'
  }, [isServerConnected, selectedModel])

  return (
    <button
      tabIndex={0}
      role="button"
      className="btn btn-active flex-1"
      disabled={noServer}
      onClick={() => settingStore.openModelSelectionModal()}
    >
      {label}
      <ChevronDown />
    </button>
  )
})

export default ModelSelector
