import { observer } from 'mobx-react-lite'

import { LmsLanguageModel } from '~/core/connection/types'

import SelectionPanelTable from '~/components/SelectionTablePanel'
import NotConnectedPanelSection from '~/features/settings/panels/model/NotConnectedPanelSection'

import LmsConnectionViewModel from '~/core/connection/viewModels/LmsConnectionViewModel'
import { settingStore } from '~/core/setting/SettingStore'

const LmsModelPanel = observer(({ connection }: { connection: LmsConnectionViewModel }) => {
  const selectedModelId = settingStore.setting?.selectedModelId

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
      onItemSelected={model => connection.selectModel(model)}
      itemFilter={connection.modelFilter}
      primarySortTypeLabel={connection.primaryHeader}
      renderRow={renderRow}
      getIsItemSelected={model => selectedModelId === model.id}
      getItemKey={model => model.id}
      filterInputPlaceholder="Filter by name or folder..."
    />
  )
})

export default LmsModelPanel
