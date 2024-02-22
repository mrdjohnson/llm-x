import { observer } from 'mobx-react-lite'

import { settingStore } from '../models/SettingStore'
import Refresh from '../icons/Refresh'

const ModelRefreshButton = observer(({ small = false }: { small?: boolean }) => {
  const noServer = !settingStore.selectedModel

  return (
    noServer && (
      <button
        className={'btn btn-ghost align-middle' + (small && ' px-2')}
        onClick={() => settingStore.updateModels()}
      >
        <Refresh />
      </button>
    )
  )
})

export default ModelRefreshButton
