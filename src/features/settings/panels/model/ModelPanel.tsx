import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import _ from 'lodash'
import { ScrollShadow, Tab, Tabs } from '@nextui-org/react'

import OllamaModelPanel from '~/features/settings/panels/model/OllamaModelPanel'
import A1111ModelPanel from '~/features/settings/panels/model/A1111ModelPanel'
import LmsModelPanel from '~/features/settings/panels/model/LmsModelPanel'
import OpenAiModelPanel from '~/features/settings/panels/model/OpenAiModelPanel'

import { connectionModelStore } from '~/features/connections/ConnectionModelStore'

import { settingStore } from '~/models/SettingStore'
import SettingSection, { SettingSectionItem } from '../../../../containers/SettingSection'
import { ServerConnectionTypes } from '../../../connections/servers'
import NewConnectionPanel from '../connections/NewConnectionPanel'

const ModelPanel = observer(() => {
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

  const items: Array<SettingSectionItem<ServerConnectionTypes>> = useMemo(() => {
    return connections.map(connectionToSectionItem)
  }, [connections])

  const itemFilter = (connection: ServerConnectionTypes, filterText: string) => {
    return connection.label.toLowerCase().includes(filterText)
  }

  return (
    <SettingSection
      items={items}
      filterProps={{
        helpText: 'Filter connections by label...',
        itemFilter,
        emptyLabel: 'No connections found',
      }}
      addButtonProps={{
        label: 'Add New Connection',
      }}
      emptySectionPanel={<NewConnectionPanel />}
      renderItemSection={connection => (
        <div className="flex-1 overflow-y-hidden pt-2">
          <ScrollShadow className="max-h-full pb-7">
            {connection.type === 'LMS' && <LmsModelPanel connection={connection} />}
            {connection.type === 'A1111' && <A1111ModelPanel connection={connection} />}
            {connection.type === 'Ollama' && <OllamaModelPanel connection={connection} />}
            {connection.type === 'OpenAi' && <OpenAiModelPanel connection={connection} />}
          </ScrollShadow>
        </div>
      )}
      selectedItem={selectedConnection && connectionToSectionItem(selectedConnection)}
      allowSmallItems={false}
    />
  )
})

export default ModelPanel
