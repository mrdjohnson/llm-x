import { observer } from 'mobx-react-lite'

import { GeminiLanguageModel } from '~/core/connection/types'

import SelectionPanelTable from '~/components/SelectionTablePanel'
import NotConnectedPanelSection from '~/features/settings/panels/model/NotConnectedPanelSection'

import GeminiConnectionViewModel from '~/core/connection/viewModels/GeminiConnectionViewModel'
import { settingStore } from '~/core/setting/SettingStore'

const GeminiModelPanel = observer(({ connection }: { connection: GeminiConnectionViewModel }) => {
  const selectedModelId = settingStore.setting?.selectedModelId

  const renderRow = (model: GeminiLanguageModel) => (
    <>
      <td>{model.modelName}</td>
    </>
  )

  if (!connection.isConnected) {
    return <NotConnectedPanelSection connection={connection} />
  }

  return (
    <SelectionPanelTable
      items={connection.models}
      sortTypes={connection.modelTableHeaders}
      onItemSelected={model => connection.selectModel(model)}
      itemFilter={connection.modelFilter}
      primarySortTypeLabel={connection.primaryHeader}
      renderRow={renderRow}
      getIsItemSelected={model => selectedModelId === model.id}
      filterInputPlaceholder="Filter by title or name..."
    />
  )
})

export default GeminiModelPanel
