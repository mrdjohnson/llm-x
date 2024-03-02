import { observer } from 'mobx-react-lite'

import { settingStore } from '../models/SettingStore'
import Refresh from '../icons/Refresh'

const ModelRefreshButton = observer(
  ({ small = false, shouldShow = false }: { small?: boolean; shouldShow?: boolean }) => {
    const noServer = !settingStore.selectedModel

    return (
      (shouldShow || noServer) && (
        <button
          className={'btn btn-ghost align-middle' + (small && ' px-2')}
          type='button'
          onClick={() => settingStore.updateModels()}
        >
          <Refresh />
        </button>
      )
    )
  },
)

export default ModelRefreshButton
