import { observer } from 'mobx-react-lite'
import { useEffect, useMemo, useRef, useState } from 'react'
import _ from 'lodash'
import { Breadcrumbs, BreadcrumbItem } from '@nextui-org/react'

import { settingStore } from '~/models/SettingStore'
import { CorrectShowResponse, ollamaStore } from '~/features/ollama/OllamaStore'
import CopyButton from '~/components/CopyButton'

import ChevronDown from '~/icons/ChevronDown'
import Globe from '~/icons/Globe'
import Image from '~/icons/Image'
import DownloadTray from '~/icons/DownloadTray'
import Delete from '~/icons/Delete'

enum SortType {
  None = 'none',
  Name = 'name',
  Size = 'size',
  Updated = 'modifiedAt',
  Params = 'paramSize',
  Image = 'supportsImages',
}

const OllamaModelPanelTable = observer(({ onModelSelected }: { onModelSelected: () => void }) => {
  const { selectedModelLabel, models } = settingStore
  const inputRef = useRef<HTMLInputElement>(null)

  const [activeSortType, setActiveSortType] = useState(SortType.None)
  const [ascendingSort, setAscendingSort] = useState(true)
  const [filterText, setFilterText] = useState('')

  const sortedModels = useMemo(() => {
    if (activeSortType === SortType.None) return models

    let direction: 'asc' | 'desc'

    // updated: "larger" aka more recent values should come first
    // image: "truthy" values should come first
    if (activeSortType === SortType.Updated || activeSortType === SortType.Image) {
      direction = ascendingSort ? 'desc' : 'asc'
    } else {
      direction = ascendingSort ? 'asc' : 'desc'
    }

    return _.orderBy(models, [activeSortType, SortType.Name], direction)
  }, [activeSortType, ascendingSort, models.length])

  const filteredModels = useMemo(() => {
    if (!filterText) return sortedModels

    return sortedModels.filter(model => model.name.includes(filterText))
  }, [filterText, sortedModels])

  const handleSortTypeChanged = (nextSortType: SortType) => {
    if (activeSortType !== nextSortType) {
      setAscendingSort(true)
      setActiveSortType(nextSortType)
    } else if (ascendingSort) {
      setAscendingSort(false)
    } else {
      setActiveSortType(SortType.None)
      setAscendingSort(true)
    }
  }

  const makeChevron = (sortType: SortType) => {
    return (
      <span
        className={
          'transition-[opacity transform] ml-2 h-fit scale-90 duration-300 ease-in-out ' +
          (ascendingSort ? ' rotate-180 ' : '') +
          (activeSortType === sortType ? ' opacity-100 ' : ' opacity-0 ')
        }
      >
        <ChevronDown />
      </span>
    )
  }

  const makeHeader = (label: string, sortType: SortType) => {
    return (
      <th>
        <span
          className="flex w-fit cursor-pointer select-none flex-row items-center underline"
          onClick={() => handleSortTypeChanged(sortType)}
        >
          {label}

          {makeChevron(sortType)}
        </span>
      </th>
    )
  }

  const pullModel = () => {
    ollamaStore.pull(filterText)

    settingStore.closeSettingsModal()
  }

  const handleModelSelected = (modelName: string) => {
    settingStore.selectModel(modelName)
    onModelSelected()
  }

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

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

  return (
    <>
      <label className="flex w-full flex-row gap-2">
        <input
          type="text"
          placeholder="Filter by name or pull..."
          className="input input-sm input-bordered sticky w-full focus:outline-none"
          onChange={e => setFilterText(e.target.value)}
          value={filterText}
          ref={inputRef}
          autoFocus
        />
      </label>

      <div className="mt-2 flex h-full flex-col overflow-y-scroll rounded-md">
        <table className="table table-zebra table-sm -mt-4 mb-4 border-separate border-spacing-y-2 pt-0">
          <thead className="sticky top-0 z-20 bg-base-300 text-base-content">
            <tr>
              {makeHeader('Name', SortType.Name)}

              {makeHeader('Params', SortType.Params)}

              <th className="table-cell w-fit">
                <span
                  className="flex w-fit cursor-pointer flex-row items-center"
                  onClick={() => handleSortTypeChanged(SortType.Image)}
                >
                  <span
                    className="tooltip tooltip-bottom w-fit border-b-[1.5px] border-b-current"
                    data-tip="Supports Images?"
                  >
                    <Image />
                  </span>

                  {makeChevron(SortType.Image)}
                </span>
              </th>

              {makeHeader('Size', SortType.Size)}

              {makeHeader('Updated', SortType.Updated)}
            </tr>
            <tr />
          </thead>

          <tbody className="-mt-4 gap-2 px-2">
            {filteredModels?.map(model => (
              <tr
                className={
                  'cursor-pointer ' +
                  (selectedModelLabel === model?.name
                    ? ' !bg-primary text-primary-content'
                    : ' hover:!bg-primary/30')
                }
                onClick={() => handleModelSelected(model.name)}
                style={{ borderTopLeftRadius: 8 }}
                key={model.name}
              >
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
                  />
                </td>

                <td>{model.gbSize}</td>
                <td className=" opacity-65">{model.timeAgo}</td>
              </tr>
            ))}
          </tbody>
        </table>

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

          {filterText && (
            <button
              className="btn btn-neutral btn-sm flex w-fit flex-row gap-2 px-4"
              onClick={pullModel}
            >
              <span className=" whitespace-nowrap text-sm ">
                Pull model: {filterText.includes(':') ? filterText : `${filterText}:latest`}
              </span>
              <DownloadTray />
            </button>
          )}
        </div>
      </div>
    </>
  )
})

const OllamaModelSettings = observer(() => {
  const { selectedModel } = settingStore

  const [modelData, setModelData] = useState<CorrectShowResponse | undefined>()

  useEffect(() => {
    if (!selectedModel) return

    ollamaStore.show(selectedModel?.name).then(setModelData)
  }, [selectedModel])

  if (!selectedModel || !modelData) return

  const details = modelData.details || {}

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

      <div className="mt-auto flex self-end">
        <button
          onClick={() => ollamaStore.delete(selectedModel.name)}
          className="btn btn-ghost self-end text-error"
        >
          <Delete className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
})

const OllamaModelPanel = observer(() => {
  const { selectedModel } = settingStore

  const [tab, setTab] = useState<'all' | 'single'>('all')

  useEffect(() => {
    // if the model changes, go into model settings
    if (!selectedModel) {
      setTab('all')
    }
  }, [selectedModel])

  return (
    <div className="relative flex h-full w-full flex-col">
      <Breadcrumbs className="mb-2">
        <BreadcrumbItem
          className={
            tab === 'all' ? ' [&>*]:!text-primary' : 'scale-90 [&>*]:!text-base-content/70'
          }
          isCurrent={tab === 'all'}
          onPress={() => setTab('all')}
        >
          Models
        </BreadcrumbItem>

        {selectedModel && (
          <BreadcrumbItem
            className={
              tab === 'single' ? ' [&>*]:!text-primary' : 'scale-90 [&>*]:!text-base-content/70'
            }
            isCurrent={tab === 'single'}
            onPress={() => setTab('single')}
          >
            {selectedModel.name}
          </BreadcrumbItem>
        )}
      </Breadcrumbs>

      {tab === 'all' || !selectedModel ? (
        <OllamaModelPanelTable onModelSelected={() => setTab('single')} />
      ) : (
        <OllamaModelSettings />
      )}
    </div>
  )
})

export default OllamaModelPanel
