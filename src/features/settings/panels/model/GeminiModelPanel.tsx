import { GeminiLanguageModel } from '~/core/connection/types'

import SelectionPanelTable from '~/components/SelectionTablePanel'
import NotConnectedPanelSection from '~/features/settings/panels/model/NotConnectedPanelSection'

import GeminiConnectionViewModel from '~/core/connection/viewModels/GeminiConnectionViewModel'
import { settingStore } from '~/core/setting/SettingStore'

const GeminiModelPanel = ({ connection }: { connection: GeminiConnectionViewModel }) => {
  const selectedModelId = settingStore.setting?.selectedModelId

  const renderRow = (model: GeminiLanguageModel, isMobile: boolean) =>
    isMobile ? (
      <div className="flex flex-col rounded-md p-2">
        <label className="mb-1 line-clamp-1 text-lg font-semibold">{model.modelName}</label>
      </div>
    ) : (
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
}

export default GeminiModelPanel
