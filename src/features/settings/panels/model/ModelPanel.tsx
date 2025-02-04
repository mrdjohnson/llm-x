import { observer } from 'mobx-react-lite'
import _ from 'lodash'
import { useParams } from 'react-router-dom'

import OllamaModelPanel from '~/features/settings/panels/model/OllamaModelPanel'
import A1111ModelPanel from '~/features/settings/panels/model/A1111ModelPanel'
import OpenAiModelPanel from '~/features/settings/panels/model/OpenAiModelPanel'
import GeminiModelPanel from '~/features/settings/panels/model/GeminiModelPanel'

import { NavButtonDiv } from '~/components/NavButton'
import SettingSection, { SettingSectionItem } from '~/containers/SettingSection'
import Drawer from '~/containers/Drawer'

import { ConnectionViewModelTypes } from '~/core/connection/viewModels'
import { connectionStore } from '~/core/connection/ConnectionStore'
import Edit from '~/icons/Edit'

export const ConnectionModelPanel = observer(() => {
  const { id } = useParams()

  const connection = connectionStore.getConnectionById(id)!

  return (
    <Drawer label={connection.label} outletContent={{ connection }}>
      <div className="flex flex-1 flex-col overflow-y-hidden px-2 pt-2">
        {connection.type === 'LMS' && <OpenAiModelPanel connection={connection} />}
        {connection.type === 'A1111' && <A1111ModelPanel connection={connection} />}
        {connection.type === 'Ollama' && <OllamaModelPanel connection={connection} />}
        {connection.type === 'OpenAi' && <OpenAiModelPanel connection={connection} />}
        {connection.type === 'Gemini' && <GeminiModelPanel connection={connection} />}
      </div>
    </Drawer>
  )
})

const ModelPanel = observer(() => {
  const { selectedConnection, connections } = connectionStore

  const connectionToSectionItem = (
    connection: ConnectionViewModelTypes,
  ): SettingSectionItem<ConnectionViewModelTypes> => ({
    id: connection.id,
    label: connection.label,
    subLabels: [
      connection.source.enabled ? 'Enabled' : 'Disabled',
      connection.isConnected ? 'Connected' : 'Disconnected',
    ],
    data: connection,
  })

  const itemFilter = (connection: ConnectionViewModelTypes, filterText: string) => {
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
        label: 'Add Model Provider',
      }}
      selectedItemId={selectedConnection?.id}
      renderActionRow={connection => (
        <NavButtonDiv
          to={'/models/edit/' + connection.id}
          className="btn btn-ghost btn-sm ml-auto justify-start px-2"
        >
          <Edit className="size-5" />
        </NavButtonDiv>
      )}
    />
  )
})

export default ModelPanel
