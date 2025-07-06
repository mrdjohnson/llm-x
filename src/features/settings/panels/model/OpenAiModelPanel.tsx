import { OpenAiLanguageModel } from '~/core/connection/types'

import SelectionPanelTable from '~/components/SelectionTablePanel'
import NotConnectedPanelSection from '~/features/settings/panels/model/NotConnectedPanelSection'

import OpenAiConnectionViewModel from '~/core/connection/viewModels/OpenAiConnectionViewModel'
import { settingStore } from '~/core/setting/SettingStore'

const OpenAiModelPanel = ({ connection }: { connection: OpenAiConnectionViewModel }) => {
  const selectedModelId = settingStore.setting?.selectedModelId

  const renderRow = (model: OpenAiLanguageModel, isMobile: boolean) =>
    isMobile ? (
      <div className="flex flex-col rounded-md p-2">
        <label className="mb-1 line-clamp-1 text-lg font-semibold">{model.modelName}</label>

        <div className="flex flex-col gap-0 opacity-60">
          <span>{model.object}</span>

          <span>{model.ownedBy}</span>
        </div>
      </div>
    ) : (
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
      onItemSelected={model => connection.selectModel(model)}
      itemFilter={connection.modelFilter}
      primarySortTypeLabel={connection.primaryHeader}
      renderRow={renderRow}
      getIsItemSelected={model => selectedModelId === model.id}
      filterInputPlaceholder="Filter by id or owned by..."
    />
  )
}

export default OpenAiModelPanel
