import { observer } from 'mobx-react-lite'
import { useEffect, useMemo, useState } from 'react'
import _ from 'lodash'

import { settingStore } from '~/core/SettingStore'
import { IOllamaModel } from '~/core/types'

import OllamaStore, { CorrectShowResponse } from '~/features/ollama/OllamaStore'

import SelectionPanelTable from '~/components/SelectionTablePanel'
import CopyButton from '~/components/CopyButton'
import BreadcrumbBar, { BreadcrumbType } from '~/components/BreadcrumbBar'
import NotConnectedPanelSection from '~/features/settings/panels/model/NotConnectedPanelSection'

import Globe from '~/icons/Globe'
import DownloadTray from '~/icons/DownloadTray'
import Delete from '~/icons/Delete'
import Edit from '~/icons/Edit'

import OllamaConnectionViewModel from '~/core/connection/viewModels/OllamaConnectionViewModel'
import { connectionStore } from '~/core/connection/ConnectionStore'

type PanelTableProps = {
  connection: OllamaConnectionViewModel
  ollamaStore: OllamaStore
  onShowDetails: () => void
}

const OllamaModelPanelTable = observer(
  ({ onShowDetails, connection, ollamaStore }: PanelTableProps) => {
    const [filterText, setFilterText] = useState('')

    const pullModel = () => {
      ollamaStore.pull(filterText)

      settingStore.closeSettingsModal()
    }

    const updateAllModels = () => {
      ollamaStore.updateAll()

      settingStore.closeSettingsModal()
    }

    if (!connection.isConnected) {
      return <NotConnectedPanelSection connection={connection} />
    }

    const renderRow = (model: IOllamaModel) => (
      <>
        <td>
          <span className="block max-w-52 overflow-hidden font-semibold xl:max-w-80">
            {model.name}
          </span>
        </td>

        <td>{model.details.parameter_size}</td>

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
        <td className="opacity-65">{model.timeAgo}</td>

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
        items={connection.models}
        sortTypes={connection.modelTableHeaders}
        primarySortTypeLabel="name"
        itemFilter={connection.modelFilter}
        renderRow={renderRow}
        getItemKey={model => model.name}
        onItemSelected={model => connectionStore.dataStore.setSelectedModel(model, connection.id)}
        onFilterChanged={setFilterText}
        getIsItemSelected={model =>
          connection.id === connectionStore.selectedConnection?.id &&
          model.modelName === connectionStore.selectedModelName
        }
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
            <span className="whitespace-nowrap text-sm">Ollama Library</span>
            <Globe />
          </a>

          {filterText ? (
            <button
              className="btn btn-neutral btn-sm flex w-fit flex-row gap-2 px-4"
              onClick={pullModel}
            >
              <span className="whitespace-nowrap text-sm">
                Pull model: {filterText.includes(':') ? filterText : `${filterText}:latest`}
              </span>
              <DownloadTray />
            </button>
          ) : (
            <button
              className="btn btn-neutral btn-sm flex w-fit flex-row gap-2 px-4"
              onClick={updateAllModels}
            >
              <span className="whitespace-nowrap text-sm">Update all models</span>
              <DownloadTray />
            </button>
          )}
        </div>
      </SelectionPanelTable>
    )
  },
)

const OllamaModelSettings = observer(({ ollamaStore }: { ollamaStore: OllamaStore }) => {
  const { selectedModelName } = connectionStore

  const [modelData, setModelData] = useState<CorrectShowResponse | undefined>()

  useEffect(() => {
    if (!selectedModelName) return

    ollamaStore.show(selectedModelName).then(setModelData)
  }, [selectedModelName])

  if (!selectedModelName || !modelData) return

  const details = modelData.details || {}

  const updateModel = () => {
    settingStore.closeSettingsModal()

    ollamaStore.pull(selectedModelName)
  }

  return (
    <div className="flex h-full flex-col">
      <label className="text-lg font-semibold text-base-content">
        {_.capitalize(selectedModelName)}

        {details && (
          <label className="text-md ml-2 text-base-content/70">
            {[modelData.details.parameter_size, modelData.details.quantization_level].join(' ')}
          </label>
        )}
      </label>

      <div className="my-4">
        <label className="label-text">ModelFile:</label>

        <div className="relative flex max-h-52 w-full flex-wrap overflow-scroll whitespace-pre-line rounded-md border border-base-content/30 p-2 pr-6">
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
          Update {selectedModelName}
          <DownloadTray />
        </button>

        <button
          onClick={() => ollamaStore.delete(selectedModelName)}
          className="btn btn-ghost btn-sm self-end text-error"
        >
          <Delete className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
})

const OllamaModelPanel = observer(({ connection }: { connection: OllamaConnectionViewModel }) => {
  const { selectedModelName, selectedConnection } = connectionStore

  const [tab, setTab] = useState<'all' | 'single'>('all')

  const ollamaStore = useMemo(() => {
    return new OllamaStore(connection)
  }, [connection])

  useEffect(() => {
    // if the model changes, go into model settings
    if (!selectedModelName) {
      setTab('all')
    }
  }, [selectedModelName])

  let selectedModelBreadcrumb: BreadcrumbType | undefined = undefined
  if (selectedModelName && selectedConnection?.id === connection.id) {
    selectedModelBreadcrumb = {
      label: selectedModelName,
      isSelected: tab === 'single',
      onClick: () => setTab('single'),
    }
  }

  return (
    <div className="relative flex h-full w-full flex-col">
      <BreadcrumbBar
        breadcrumbs={[
          {
            label: 'Models',
            isSelected: tab === 'all',
            onClick: () => setTab('all'),
          },
          selectedModelBreadcrumb,
        ]}
      />

      {tab === 'all' || !selectedModelName ? (
        <OllamaModelPanelTable
          connection={connection}
          ollamaStore={ollamaStore}
          onShowDetails={() => setTab('single')}
        />
      ) : (
        <OllamaModelSettings ollamaStore={ollamaStore} />
      )}
    </div>
  )
})

export default OllamaModelPanel
