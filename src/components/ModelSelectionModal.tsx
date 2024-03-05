import { observer } from 'mobx-react-lite'
import { useEffect, useRef } from 'react'

import { settingStore } from '../models/SettingStore'
import Globe from '../icons/Globe'
import Image from '../icons/Image'

const ModelSelectionModal = observer(() => {
  const { selectedModel, models } = settingStore

  const modalRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    settingStore.setModelSelectionModalRef(modalRef)
  }, [modalRef])

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
            <thead className="sticky top-0 bg-base-200 z-20">
              <tr>
                <th>Name</th>
                <th>Size</th>
                <th>Updated</th>
                <th>Params</th>
                <th className="tooltip tooltip-bottom table-cell" data-tip="Supports Images?">
                  <Image />
                </th>
              </tr>
              <tr />
            </thead>

            <tbody className="gap-2 ">
              {models?.map(model => (
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
                      defaultChecked
                      className="checkbox checkbox-xs tooltip tooltip-bottom"
                      data-tip="Supports Images?"
                      checked={model.supportsImages}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <a
            href="https://ollama.com/library"
            className="btn btn-outline btn-neutral btn-sm mx-auto mt-4 flex w-fit flex-row gap-2 px-4"
            target='__blank'
            title='Open Ollama Library in new tab'
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
