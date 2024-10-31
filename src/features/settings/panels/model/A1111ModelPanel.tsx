import { observer } from 'mobx-react-lite'

import { LanguageModelType } from '~/core/LanguageModel'
import A1111ServerConnection from '~/core/connections/servers/A1111ServerConnection'
import { connectionModelStore } from '~/core/connections/ConnectionModelStore'

import { IA1111Model } from '~/core/types'

import SelectionPanelTable from '~/components/SelectionTablePanel'
import NotConnectedPanelSection from '~/features/settings/panels/model/NotConnectedPanelSection'

const A1111ModelPanel = observer(({ connection }: { connection: A1111ServerConnection }) => {
  const renderRow = (model: LanguageModelType<IA1111Model>) => (
    <>
      <td>{model.modelName}</td>
      <td>{model.title}</td>
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
      itemFilter={connection.modelFilter}
      primarySortTypeLabel={connection.primaryHeader}
      renderRow={renderRow}
      getIsItemSelected={model =>
        connection.id === connectionModelStore.selectedConnection?.id &&
        model.modelName === connectionModelStore.selectedModelName
      }
      getItemKey={model => model.id}
      filterInputPlaceholder="Filter by title or name..."
    />
  )
})

export default A1111ModelPanel
