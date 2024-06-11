import { observer } from 'mobx-react-lite'

import OpenAiServerConnection from '~/features/connections/servers/OpenAiServerConnection'
import { connectionModelStore } from '~/features/connections/ConnectionModelStore'

import { OpenAiLanguageModel } from '~/models/types'

import SelectionPanelTable from '~/components/SelectionTablePanel'
import NotConnectedPanelSection from '~/features/settings/panels/model/NotConnectedPanelSection'

const OpenAiModelPanel = observer(({ connection }: { connection: OpenAiServerConnection }) => {
  const renderRow = (model: OpenAiLanguageModel) => (
    <>
      <td>
        <button
          className="block max-w-80 overflow-hidden font-semibold xl:max-w-full"
          title={model.modelName}
        >
          {model.modelName}
        </button>
      </td>

      <td>{model.object}</td>

      <td>{model.ownedBy}</td>
    </>
  )

  if (!connection.isConnected) {
    return <NotConnectedPanelSection connection={connection} />
  }

  return (
    <SelectionPanelTable
      items={connection.models}
      sortTypes={connection.modelTableHeaders}
      onItemSelected={model =>
        connectionModelStore.dataStore.setSelectedModel(model, connection.id)
      }
      itemFilter={(model, filterText) => {
        return model.modelName.toLowerCase().includes(filterText.toLowerCase())
      }}
      primarySortTypeLabel={connection.primaryHeader}
      renderRow={renderRow}
      getIsItemSelected={model =>
        connection.id === connectionModelStore.selectedConnection?.id &&
        model.modelName === connectionModelStore.selectedModelName
      }
      getItemKey={model => model.id}
      filterInputPlaceholder="Filter by name or folder..."
    />
  )
})

export default OpenAiModelPanel
