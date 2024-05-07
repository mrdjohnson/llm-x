import { observer } from 'mobx-react-lite'
import { useEffect, useMemo, useRef, useState } from 'react'
import _ from 'lodash'

import { settingStore } from '~/models/SettingStore'

import ChevronDown from '~/icons/ChevronDown'

enum SortType {
  None = 'none',
  Name = 'name',
  Size = 'size',
  Architecture = 'architecture',
  Folder = 'folder',
}

const LmsModelPanel = observer(() => {
  const { selectedModelLabel, lmsModels } = settingStore
  const inputRef = useRef<HTMLInputElement>(null)

  const [activeSortType, setActiveSortType] = useState(SortType.None)
  const [ascendingSort, setAscendingSort] = useState(true)
  const [filterText, setFilterText] = useState('')

  const sortedModels = useMemo(() => {
    if (activeSortType === SortType.None) return lmsModels

    const direction = ascendingSort ? 'asc' : 'desc'

    return _.orderBy(lmsModels, [activeSortType, SortType.Name], direction)
  }, [activeSortType, ascendingSort, lmsModels.length])

  const filteredModels = useMemo(() => {
    if (!filterText) return sortedModels

    return sortedModels.filter(model => model.path.toLowerCase().includes(filterText.toLowerCase()))
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
        <button
          className="flex w-fit cursor-pointer select-none flex-row items-center underline"
          onClick={() => handleSortTypeChanged(sortType)}
        >
          {label}

          {makeChevron(sortType)}
        </button>
      </th>
    )
  }

  const handleModelSelected = (modelPath: string) => {
    settingStore.selectModel(modelPath, 'LMS')
  }

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  if (!settingStore.isLmsServerConnected) {
    const openLmsPanel = () => {
      settingStore.setModelType('LMS')
      settingStore.openSettingsModal('general')
    }

    return (
      <div className="flex w-full flex-col justify-center gap-3">
        <span className="text-center text-lg font-semibold">Lm Studio is not currently active</span>

        <button className="btn btn-active" onClick={openLmsPanel}>
          Go to Lm Studio settings
        </button>
      </div>
    )
  }

  return (
    <>
      <label className="flex w-full flex-row gap-2">
        <input
          type="text"
          placeholder="Filter by name or folder..."
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

              {makeHeader('Size', SortType.Size)}

              {makeHeader('Type', SortType.Architecture)}

              {makeHeader('Folder', SortType.Folder)}
            </tr>
            <tr />
          </thead>

          <tbody className="-mt-4 gap-2 px-2">
            {filteredModels?.map(model => (
              <tr
                className={
                  'cursor-pointer ' +
                  (selectedModelLabel === model.name
                    ? ' !bg-primary text-primary-content'
                    : ' hover:!bg-primary/30')
                }
                onClick={() => handleModelSelected(model.path)}
                style={{ borderTopLeftRadius: 8 }}
                key={model.path}
              >
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
})

export default LmsModelPanel
