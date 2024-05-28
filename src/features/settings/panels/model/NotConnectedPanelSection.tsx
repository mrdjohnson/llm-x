import Refresh from '~/icons/Refresh'
import { settingStore } from '~/models/SettingStore'
import { connectionModelStore } from '~/features/connections/ConnectionModelStore'
import { ServerConnectionTypes } from '~/features/connections/servers'

const NotConnectedPanelSection = ({ connection }: { connection: ServerConnectionTypes }) => {
  const openConnectionSettings = () => {
    connectionModelStore.dataStore.setSelectedConnectionById(connection.id)
    settingStore.openSettingsModal('general')
  }

  return (
    <div className="flex w-full flex-col justify-center gap-3">
      <span className="flex justify-center gap-2 align-baseline text-lg font-semibold">
        {connection.label} is not currently active
        <button onClick={() => connection.fetchLmModels()}>
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
