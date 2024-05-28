import { observer } from 'mobx-react-lite'

import LmsServerConnection from '~/features/connections/servers/LmsServerConnection'
import { connectionModelStore } from '~/features/connections/ConnectionModelStore'

import { LmsLanguageModel } from '~/models/types'

import SelectionPanelTable from '~/components/SelectionTablePanel'
import NotConnectedPanelSection from '~/features/settings/panels/model/NotConnectedPanelSection'

const LmsModelPanel = observer(({ connection }: { connection: LmsServerConnection }) => {
  const renderRow = (model: LmsLanguageModel) => (
    <>
      <td>
        <button
          className="block max-w-80 overflow-hidden font-semibold xl:max-w-full"
          title={model.path}
        >
          {model.name}
        </button>
      </td>

      <td>{model.gbSize}</td>

      <td>{model.architecture}</td>

      <td>{model.folder}</td>
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

export default LmsModelPanel
