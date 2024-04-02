import { observer } from 'mobx-react-lite'
import { useMemo, useState } from 'react'
import _ from 'lodash'

import { settingStore } from '~/models/SettingStore'

import ChevronDown from '~/icons/ChevronDown'
import Globe from '~/icons/Globe'

enum SortType {
  None = 'none',
  Title = 'title',
  Name = 'modelName',
}

const A1111ModelPanel = observer(() => {
  const { selectedModelLabel, a1111Models: models } = settingStore

  const [activeSortType, setActiveSortType] = useState(SortType.None)
  const [ascendingSort, setAscendingSort] = useState(true)

  const sortedModels = useMemo(() => {
    if (activeSortType === SortType.None) return models

    const direction = ascendingSort ? 'asc' : 'desc'

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

  if (!settingStore.isA1111ServerConnected) {
    const openA1111Panel = () => {
      settingStore.setModelType('A1111')
      settingStore.openSettingsModal('general')
    }

    return (
      <div className="flex w-full flex-col justify-center gap-3">
        <span className="text-center text-lg font-semibold">
          Image generation through AUTOMATIC1111 is not currently active
        </span>

        <button className="btn btn-active" onClick={openA1111Panel}>
          Go to A1111 settings
        </button>
      </div>
    )
  }

  return (
    <div className="relative flex h-full w-full flex-col">
      {/* <label className="flex flex-row gap-2">
        <input
          type="text"
          placeholder="Filter..."
          className="input input-sm input-bordered sticky focus:outline-none"
        />
      </label> */}

      <div className="mt-2 h-full overflow-y-scroll rounded-md">
        <table className="table table-zebra -mt-4 mb-4 border-separate border-spacing-y-2 pt-0">
          <thead className="sticky top-0 z-20 bg-base-300 text-base-content">
            <tr>
              {makeHeader('Name', SortType.Name)}
              {makeHeader('Title', SortType.Title)}
            </tr>
            <tr />
          </thead>

          <tbody className="-mt-4 gap-2 px-2">
            {sortedModels?.map(model => (
              <tr
                className={
                  'cursor-pointer ' +
                  (selectedModelLabel === model.modelName
                    ? ' !bg-primary text-primary-content'
                    : ' hover:!bg-primary/30')
                }
                onClick={() => settingStore.selectModel(model.modelName, 'A1111')}
                style={{ borderTopLeftRadius: 8 }}
                key={model.title}
              >
                <td>{model.modelName}</td>
                <td>{model.title}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <a
          href="https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki/Installation-on-Apple-Silicon#downloading-stable-diffusion-models"
          className="btn btn-outline btn-neutral btn-sm mx-auto mt-auto flex w-fit flex-row gap-2 px-4"
          target="__blank"
          title="Open Ollama Library in new tab"
        >
          <span className=" whitespace-nowrap text-sm ">How to download more models</span>
          <Globe />
        </a>
      </div>
    </div>
  )
})

export default A1111ModelPanel
