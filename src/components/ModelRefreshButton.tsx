import { observer } from 'mobx-react-lite'

import Refresh from '~/icons/Refresh'
import { connectionModelStore } from '~/core/connections/ConnectionModelStore'

const ModelRefreshButton = observer(
  ({ small = false, shouldShow = false }: { small?: boolean; shouldShow?: boolean }) => {
    const noServer = !connectionModelStore.isAnyServerConnected

    return (
      (shouldShow || noServer) && (
        <button
          className={'btn btn-ghost align-middle ' + (small && 'px-2')}
          type="button"
          onClick={() => connectionModelStore.refreshModels()}
          title="Refresh models"
        >
          <Refresh />
        </button>
      )
    )
  },
)

export default ModelRefreshButton
