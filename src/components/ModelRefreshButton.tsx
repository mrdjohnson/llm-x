import { twMerge } from 'tailwind-merge'

import Refresh from '~/icons/Refresh'
import { connectionStore } from '~/core/connection/ConnectionStore'

const ModelRefreshButton = ({
  small = false,
  shouldShow = false,
}: {
  small?: boolean
  shouldShow?: boolean
}) => {
  const noServer = !connectionStore.isAnyServerConnected

  return (
    (shouldShow || noServer) && (
      <button
        className={twMerge('btn btn-ghost btn-sm align-middle md:btn-md', small && 'px-2')}
        type="button"
        onClick={() => connectionStore.refreshModels()}
        title="Refresh models"
      >
        <Refresh />
      </button>
    )
  )
}

export default ModelRefreshButton
