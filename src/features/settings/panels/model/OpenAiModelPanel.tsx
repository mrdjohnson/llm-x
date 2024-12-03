import { observer } from 'mobx-react-lite'

import { OpenAiLanguageModel } from '~/core/connection/types'

import SelectionPanelTable from '~/components/SelectionTablePanel'
import NotConnectedPanelSection from '~/features/settings/panels/model/NotConnectedPanelSection'

import OpenAiConnectionViewModel from '~/core/connection/viewModels/OpenAiConnectionViewModel'
import { settingStore } from '~/core/setting/SettingStore'

const OpenAiModelPanel = observer(({ connection }: { connection: OpenAiConnectionViewModel }) => {
  const selectedModelId = settingStore.setting?.selectedModelId

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
      onItemSelected={model => connection.selectModel(model)}
      itemFilter={connection.modelFilter}
      primarySortTypeLabel={connection.primaryHeader}
      renderRow={renderRow}
      getIsItemSelected={model => selectedModelId === model.id}
      filterInputPlaceholder="Filter by id or owned by..."
    />
  )
})

export default OpenAiModelPanel
