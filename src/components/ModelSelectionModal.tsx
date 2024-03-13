import { observer } from 'mobx-react-lite'
import { useEffect, useMemo, useRef, useState } from 'react'
import _ from 'lodash'

import { settingStore } from '../models/SettingStore'

import ChevronDown from '../icons/ChevronDown'
import Globe from '../icons/Globe'
import Image from '../icons/Image'

enum SortType {
  None = 'none',
  Name = 'name',
  Size = 'size',
  Updated = 'modifiedAt',
  Params = 'paramSize',
  Image = 'supportsImages',
}

const ModelSelectionModal = observer(() => {
  const { selectedModel, models } = settingStore

  const modalRef = useRef<HTMLDialogElement>(null)

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

  useEffect(() => {
    settingStore.setModelSelectionModalRef(modalRef)
  }, [modalRef])

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
    <dialog ref={modalRef} id="help-modal" className="modal modal-top">
      <div className="modal-box-container relative rounded-md">
        <div
          className="btn btn-ghost btn-sm absolute right-1 top-1 z-30 !text-lg opacity-70 md:btn-md"
          onClick={() => modalRef.current?.close()}
        >
          x
        </div>

        <div className="modal-box-content no-scrollbar relative mb-3 max-h-[500px] overflow-y-auto pt-0">
          <table className="table table-zebra mt-0 border-separate border-spacing-y-2 pt-0">
            <thead className="sticky top-0 z-20 bg-base-200">
              <tr>
                {makeHeader('Name', SortType.Name)}

                {makeHeader('Size', SortType.Size)}

                {makeHeader('Updated', SortType.Updated)}

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
              </tr>
              <tr />
            </thead>

            <tbody className="gap-2 ">
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
                  <td>{model.gbSize}</td>
                  <td>{model.timeAgo}</td>
                  <td>{model.details.parameterSize}</td>

                  <td>
                    <input
                      type="checkbox"
                      defaultChecked={model.supportsImages}
                      className="checkbox checkbox-xs tooltip tooltip-bottom"
                      data-tip="Supports Images?"
                    />
                  </td>
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
      </div>

      <form method="dialog" className="modal-backdrop">
        {/* close button */}
        <button />
      </form>
    </dialog>
  )
})

export default ModelSelectionModal
