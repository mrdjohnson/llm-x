import Refresh from '~/icons/Refresh'

import { ConnectionViewModelTypes } from '~/core/connection/viewModels'
import { NavButtonDiv } from '~/components/NavButton'

const NotConnectedPanelSection = ({ connection }: { connection: ConnectionViewModelTypes }) => {
  return (
    <div className="flex w-full flex-col justify-center gap-3">
      <span className="flex items-center justify-center gap-2 text-lg font-semibold">
        Unable to get models for {connection.label}
        <button className="btn btn-ghost btn-xs px-1" onClick={() => connection.fetchLmModels()}>
          <Refresh />
        </button>
      </span>

      <NavButtonDiv to={`/models/edit/${connection.id}`} className="btn btn-active">
        Go to {connection.label} settings
      </NavButtonDiv>
    </div>
  )
}

export default NotConnectedPanelSection
