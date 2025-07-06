import { A1111LanguageModel } from '~/core/connection/types'

import SelectionPanelTable from '~/components/SelectionTablePanel'
import NotConnectedPanelSection from '~/features/settings/panels/model/NotConnectedPanelSection'

import A1111ConnectionViewModel from '~/core/connection/viewModels/A1111ConnectionViewModel'
import { settingStore } from '~/core/setting/SettingStore'

const A1111ModelPanel = ({ connection }: { connection: A1111ConnectionViewModel }) => {
  const selectedModelId = settingStore.setting?.selectedModelId

  const renderRow = (model: A1111LanguageModel, isMobile: boolean) =>
    isMobile ? (
      <div className="flex flex-col rounded-md p-2">
        <label className="mb-1 line-clamp-1 text-lg font-semibold">{model.modelName}</label>

        <div className="flex flex-col gap-0 opacity-60">
          <span>{model.title}</span>
        </div>
      </div>
    ) : (
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
      onItemSelected={model => connection.selectModel(model)}
      itemFilter={connection.modelFilter}
      primarySortTypeLabel={connection.primaryHeader}
      renderRow={renderRow}
      getIsItemSelected={model => selectedModelId === model.id}
      filterInputPlaceholder="Filter by title or name..."
    />
  )
}

export default A1111ModelPanel
