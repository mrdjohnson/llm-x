import { observer } from 'mobx-react-lite'

import OpenAiConnectionViewModel from '~/core/connection/viewModels/OpenAiConnectionViewModel'
import { connectionStore } from '~/core/connection/ConnectionStore'

import { OpenAiLanguageModel } from '~/core/types'

import SelectionPanelTable from '~/components/SelectionTablePanel'
import NotConnectedPanelSection from '~/features/settings/panels/model/NotConnectedPanelSection'

const OpenAiModelPanel = observer(({ connection }: { connection: OpenAiConnectionViewModel }) => {
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
      onItemSelected={model => connectionStore.dataStore.setSelectedModel(model, connection.id)}
      itemFilter={connection.modelFilter}
      primarySortTypeLabel={connection.primaryHeader}
      renderRow={renderRow}
      getIsItemSelected={model =>
        connection.id === connectionStore.selectedConnection?.id &&
        model.modelName === connectionStore.selectedModelName
      }
      getItemKey={model => model.id}
      filterInputPlaceholder="Filter by id or owned by..."
    />
  )
})

export default OpenAiModelPanel
