import { observer } from 'mobx-react-lite'

import ChevronDown from '../icons/ChevronDown'
import { settingStore } from '../models/SettingStore'

const ModelSelector = observer(() => {
  const { selectedModel } = settingStore

  return (
    <button
      tabIndex={0}
      role="button"
      className="btn btn-active w-full"
      disabled={!selectedModel}
      onClick={() => settingStore.openModelSelectionModal()}
    >
      {selectedModel?.name || 'No models available'}
      <ChevronDown />
    </button>
  )
})

export default ModelSelector
