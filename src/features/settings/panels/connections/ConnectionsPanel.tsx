import { useMemo } from 'react'
import { observer } from 'mobx-react-lite'

import SettingSection, { SettingSectionItem } from '~/containers/SettingSection'

import NewConnectionPanel from '~/features/settings/panels/connections/NewConnectionPanel'
import { connectionModelStore } from '~/features/connections/ConnectionModelStore'
import ConnectionPanel from '~/features/settings/panels/connections/ConnectionPanel'
import { ServerConnectionTypes } from '~/features/connections/servers'

const ConnectionsPanel = observer(() => {
  const { selectedConnectionModelId, connections } = connectionModelStore

  const selectedConnection = useMemo(() => {
    return connectionModelStore.getConnectionById(selectedConnectionModelId)
  }, [selectedConnectionModelId])

  const connectionToSectionItem = (
    connection: ServerConnectionTypes,
  ): SettingSectionItem<ServerConnectionTypes> => ({
    id: connection.id,
    label: connection.label,
    subLabels: [connection.enabled ? 'Enabled' : 'Disabled'],
    data: connection,
  })

  const itemFilter = (connection: ServerConnectionTypes, filterText: string) => {
    return connection.label.toLowerCase().includes(filterText)
  }

  return (
    <SettingSection
      items={connections.map(connectionToSectionItem)}
      filterProps={{
        helpText: 'Filter connections by label...',
        itemFilter,
        emptyLabel: 'No connections found',
      }}
      addButtonProps={{
        label: 'Add New Connection',
      }}
      emptySectionPanel={<NewConnectionPanel />}
      renderItemSection={connection => <ConnectionPanel connection={connection} />}
      selectedItem={selectedConnection && connectionToSectionItem(selectedConnection)}
      allowSmallItems={false}
    />
  )
})

export default ConnectionsPanel
