import { observer } from 'mobx-react-lite'

import { settingStore } from '~/models/SettingStore'

import { ILmsModel } from '~/features/lmstudio/LmsStore'
import SelectionPanelTable, {
  SortType as SelectionPanelSortType,
} from '~/components/SelectionTablePanel'

const lmsModelSortTypes: Array<SelectionPanelSortType<ILmsModel>> = [
  { label: 'Name', value: 'name' },
  { label: 'Size', value: 'sizeBytes' },
  { label: 'Type', value: 'architecture' },
  { label: 'Folder', value: 'folder' },
]

const LmsModelPanel = observer(() => {
  const { selectedModelLabel, lmsModels: models } = settingStore

  const handleModelSelected = (modelPath: string) => {
    settingStore.selectModel(modelPath, 'LMS')
  }

  if (!settingStore.isLmsServerConnected) {
    const openLmsPanel = () => {
      settingStore.setModelType('LMS')
      settingStore.openSettingsModal('general')
    }

    return (
      <div className="flex w-full flex-col justify-center gap-3">
        <span className="text-center text-lg font-semibold">LM Studio is not currently active</span>

        <button className="btn btn-active" onClick={openLmsPanel}>
          Go to LM Studio settings
        </button>
      </div>
    )
  }

  const renderRow = (model: ILmsModel) => (
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

  return (
    <SelectionPanelTable
      items={models}
      sortTypes={lmsModelSortTypes}
      primarySortTypeLabel="name"
      itemFilter={(model: ILmsModel, filterText: string) =>
        model.name.toLowerCase().includes(filterText.toLowerCase())
      }
      renderRow={renderRow}
      getItemKey={model => model.path}
      onItemSelected={model => handleModelSelected(model.path)}
      getIsItemSelected={model => model.name === selectedModelLabel}
      filterInputPlaceholder="Filter by name or folder..."
    />
  )
})

export default LmsModelPanel
