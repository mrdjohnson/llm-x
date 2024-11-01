import Refresh from '~/icons/Refresh'
import { settingStore } from '~/core/SettingStore'
import { connectionStore } from '~/core/connection/ConnectionStore'
import { ConnectionViewModelTypes } from '~/core/connection/viewModels'

const NotConnectedPanelSection = ({ connection }: { connection: ConnectionViewModelTypes }) => {
  const openConnectionSettings = () => {
    connectionStore.dataStore.setSelectedConnectionById(connection.id)
    settingStore.openSettingsModal('connections')
  }

  return (
    <div className="flex w-full flex-col justify-center gap-3">
      <span className="flex items-center justify-center gap-2 text-lg font-semibold">
        Unable to get models for {connection.label}
        <button className="btn btn-ghost btn-xs px-1" onClick={() => connection.fetchLmModels()}>
          <Refresh />
        </button>
      </span>

      <button className="btn btn-active" onClick={openConnectionSettings}>
        Go to {connection.label} settings
      </button>
    </div>
  )
}

export default NotConnectedPanelSection
