import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'
import _ from 'lodash'

import { settingStore } from '~/models/SettingStore'
import { IOllamaModel } from '~/models/OllamaModel'

import { CorrectShowResponse, ollamaStore } from '~/features/ollama/OllamaStore'

import SelectionPanelTable, {
  SortType as SelectionPanelSortType,
} from '~/components/SelectionTablePanel'
import CopyButton from '~/components/CopyButton'
import BreadcrumbBar from '~/components/BreadcrumbBar'

import Globe from '~/icons/Globe'
import Image from '~/icons/Image'
import DownloadTray from '~/icons/DownloadTray'
import Delete from '~/icons/Delete'
import Edit from '~/icons/Edit'

const ollamaModelSortTypes: Array<SelectionPanelSortType<IOllamaModel>> = [
  { label: 'Name', value: 'name' },
  { label: 'Params', value: 'paramSize' },
  { label: <Image />, value: 'supportsImages', tooltip: 'Supports Images?', invertOrder: true },
  { label: 'Size', value: 'size' },
  { label: 'Updated', value: 'modifiedAt', invertOrder: true },
]

const OllamaModelPanelTable = observer(({ onShowDetails }: { onShowDetails: () => void }) => {
  const { selectedModelLabel, ollamaModels: models } = settingStore

  const [filterText, setFilterText] = useState('')

  const pullModel = () => {
    ollamaStore.pull(filterText)

    settingStore.closeSettingsModal()
  }

  const updateAllModels = () => {
    ollamaStore.updateAll()

    settingStore.closeSettingsModal()
  }

  const handleModelSelected = (modelName: string) => {
    settingStore.selectModel(modelName)
  }

  if (!settingStore.isServerConnected) {
    const openOllamaPanel = () => {
      settingStore.setModelType('Ollama')
      settingStore.openSettingsModal('general')
    }

    return (
      <div className="flex w-full flex-col justify-center gap-3">
        <span className="text-center text-lg font-semibold">Ollama is not currently active</span>

        <button className="btn btn-active" onClick={openOllamaPanel}>
          Go to Ollama settings
        </button>
      </div>
    )
  }

  const renderRow = (model: IOllamaModel) => (
    <>
      <td>
        <span className="block max-w-52 overflow-hidden font-semibold xl:max-w-80">
          {model.name}
        </span>
      </td>

      <td>{model.details.parameterSize}</td>

      <td>
        <input
          type="checkbox"
          defaultChecked={model.supportsImages}
          className="checkbox checkbox-xs tooltip tooltip-bottom"
          data-tip="Supports Images?"
          onClick={e => e.preventDefault()}
        />
      </td>

      <td>{model.gbSize}</td>
      <td className=" opacity-65">{model.timeAgo}</td>

      <td className="w-fit">
        <button
          className="align-center flex opacity-30 transition-opacity duration-200 ease-in-out hover:opacity-100"
          onClick={onShowDetails}
        >
          <Edit />
        </button>
      </td>
    </>
  )

  return (
    <SelectionPanelTable
      items={models}
      sortTypes={ollamaModelSortTypes}
      primarySortTypeLabel="name"
      itemFilter={(model: IOllamaModel, filterText: string) =>
        model.name.toLowerCase().includes(filterText.toLowerCase())
      }
      renderRow={renderRow}
      getItemKey={model => model.name}
      onItemSelected={model => handleModelSelected(model.name)}
      onFilterChanged={setFilterText}
      getIsItemSelected={model => model.name === selectedModelLabel}
      filterInputPlaceholder="Filter by name or pull..."
      includeEmptyHeader
    >
      <div className="mx-auto mt-auto flex flex-row content-center gap-2">
        <a
          href="https://ollama.com/library"
          className="btn btn-outline btn-neutral btn-sm flex w-fit flex-row gap-2 px-4"
          target="__blank"
          title="Open Ollama Library in new tab"
        >
          <span className=" whitespace-nowrap text-sm ">Ollama Library</span>
          <Globe />
        </a>

        {filterText ? (
          <button
            className="btn btn-neutral btn-sm flex w-fit flex-row gap-2 px-4"
            onClick={pullModel}
          >
            <span className=" whitespace-nowrap text-sm ">
              Pull model: {filterText.includes(':') ? filterText : `${filterText}:latest`}
            </span>
            <DownloadTray />
          </button>
        ) : (
          <button
            className="btn btn-neutral btn-sm flex w-fit flex-row gap-2 px-4"
            onClick={updateAllModels}
          >
            <span className=" whitespace-nowrap text-sm ">Update all models</span>
            <DownloadTray />
          </button>
        )}
      </div>
    </SelectionPanelTable>
  )
})

const OllamaModelSettings = observer(() => {
  const { selectedOllamaModel: selectedModel } = settingStore

  const [modelData, setModelData] = useState<CorrectShowResponse | undefined>()

  useEffect(() => {
    if (!selectedModel) return

    ollamaStore.show(selectedModel?.name).then(setModelData)
  }, [selectedModel])

  if (!selectedModel || !modelData) return

  const details = modelData.details || {}

  const updateModel = () => {
    settingStore.closeSettingsModal()

    ollamaStore.pull(selectedModel.name)
  }

  return (
    <div className="flex h-full flex-col">
      <label className="text-lg font-semibold text-base-content ">
        {_.capitalize(selectedModel.name)}

        {details && (
          <label className="text-md ml-2 text-base-content/70">
            {[modelData.details.parameter_size, modelData.details.quantization_level].join(' ')}
          </label>
        )}
      </label>

      <div className="my-4">
        <label className="label-text">ModelFile:</label>

        <div className=" relative flex max-h-52 w-full flex-wrap overflow-scroll whitespace-pre-line rounded-md border border-base-content/30 p-2 pr-6">
          {modelData.modelfile.replace(/\n/g, '  \n')}

          <CopyButton
            className="absolute right-2 top-2 text-base-content/30 hover:text-base-content"
            text={modelData.modelfile}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {Object.entries(modelData.details).map(
          ([key, value]) =>
            value && (
              <p key={key}>
                {key}:
                <span className="ml-2 scale-90 text-base-content/70">{JSON.stringify(value)}</span>
              </p>
            ),
        )}
      </div>

      <div className="mt-auto flex justify-between">
        <button onClick={updateModel} className="btn btn-neutral btn-sm">
          Update {selectedModel.name}
          <DownloadTray />
        </button>

        <button
          onClick={() => ollamaStore.delete(selectedModel.name)}
          className="btn btn-ghost btn-sm self-end text-error"
        >
          <Delete className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
})

const OllamaModelPanel = observer(() => {
  const { selectedOllamaModel: selectedModel } = settingStore

  const [tab, setTab] = useState<'all' | 'single'>('all')

  useEffect(() => {
    // if the model changes, go into model settings
    if (!selectedModel) {
      setTab('all')
    }
  }, [selectedModel])

  return (
    <div className="relative flex h-full w-full flex-col">
      <BreadcrumbBar
        breadcrumbs={[
          {
            label: 'Models',
            isSelected: tab === 'all',
            onClick: () => setTab('all'),
          },
          selectedModel && {
            label: selectedModel.name,
            isSelected: tab === 'single',
            onClick: () => setTab('single'),
          },
        ]}
      />

      {tab === 'all' || !selectedModel ? (
        <OllamaModelPanelTable onShowDetails={() => setTab('single')} />
      ) : (
        <OllamaModelSettings />
      )}
    </div>
  )
})

export default OllamaModelPanel
