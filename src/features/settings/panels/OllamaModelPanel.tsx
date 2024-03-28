import { observer } from 'mobx-react-lite'
import { useMemo, useState } from 'react'
import _ from 'lodash'

import { settingStore } from '~/models/SettingStore'

import ChevronDown from '~/icons/ChevronDown'
import Globe from '~/icons/Globe'
import Image from '~/icons/Image'

enum SortType {
  None = 'none',
  Name = 'name',
  Size = 'size',
  Updated = 'modifiedAt',
  Params = 'paramSize',
  Image = 'supportsImages',
}

const OllamaModelPanel = observer(() => {
  const { selectedModel, models } = settingStore

  const [activeSortType, setActiveSortType] = useState(SortType.None)
  const [ascendingSort, setAscendingSort] = useState(true)

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

  return (
    <div className="w-full">
      <table className="table table-zebra -mt-2 border-separate border-spacing-y-2 pt-0">
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

        <tbody className="-mt-2 gap-2">
          {sortedModels?.map(model => (
            <tr
              className={
                'cursor-pointer ' +
                (selectedModel === model
                  ? ' !bg-primary text-primary-content'
                  : ' hover:!bg-primary/30')
              }
              onClick={() => settingStore.selectModel(model.name)}
              style={{ borderTopLeftRadius: 8 }}
              key={model.name}
            >
              <td>{model.name}</td>
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

      <a
        href="https://ollama.com/library"
        className="btn btn-outline btn-neutral btn-sm mx-auto mt-4 flex w-fit flex-row gap-2 px-4"
        target="__blank"
        title="Open Ollama Library in new tab"
      >
        <span className=" whitespace-nowrap text-sm ">Ollama Library</span>
        <Globe />
      </a>
    </div>
  )
})

export default OllamaModelPanel
