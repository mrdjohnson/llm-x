import { observer } from 'mobx-react-lite'

import { A1111LanguageModel } from '~/core/connection/types'

import SelectionPanelTable from '~/components/SelectionTablePanel'
import NotConnectedPanelSection from '~/features/settings/panels/model/NotConnectedPanelSection'

import A1111ConnectionViewModel from '~/core/connection/viewModels/A1111ConnectionViewModel'
import { settingStore } from '~/core/setting/SettingStore'

const A1111ModelPanel = observer(({ connection }: { connection: A1111ConnectionViewModel }) => {
  const selectedModelId = settingStore.setting?.selectedModelId

  const renderRow = (model: A1111LanguageModel) => (
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
})

export default A1111ModelPanel
