import { observer } from 'mobx-react-lite'

import LmsConnectionViewModel from '~/core/connection/viewModels/LmsConnectionViewModel'
import { connectionStore } from '~/core/connection/ConnectionStore'

import { LmsLanguageModel } from '~/core/types'

import SelectionPanelTable from '~/components/SelectionTablePanel'
import NotConnectedPanelSection from '~/features/settings/panels/model/NotConnectedPanelSection'

const LmsModelPanel = observer(({ connection }: { connection: LmsConnectionViewModel }) => {
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
      onItemSelected={model => connectionStore.dataStore.setSelectedModel(model, connection.id)}
      itemFilter={connection.modelFilter}
      primarySortTypeLabel={connection.primaryHeader}
      renderRow={renderRow}
      getIsItemSelected={model =>
        connection.id === connectionStore.selectedConnection?.id &&
        model.modelName === connectionStore.selectedModelName
      }
      getItemKey={model => model.id}
      filterInputPlaceholder="Filter by name or folder..."
    />
  )
})

export default LmsModelPanel
