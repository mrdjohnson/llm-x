import { observer } from 'mobx-react-lite'

import Refresh from '~/icons/Refresh'
import { connectionStore } from '~/core/connection/ConnectionStore'

const ModelRefreshButton = observer(
  ({ small = false, shouldShow = false }: { small?: boolean; shouldShow?: boolean }) => {
    const noServer = !connectionStore.isAnyServerConnected

    return (
      (shouldShow || noServer) && (
        <button
          className={'btn btn-ghost align-middle ' + (small && 'px-2')}
          type="button"
          onClick={() => connectionStore.refreshModels()}
          title="Refresh models"
        >
          <Refresh />
        </button>
      )
    )
  },
)

export default ModelRefreshButton
