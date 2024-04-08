import { observer } from 'mobx-react-lite'
import { getSnapshot } from 'mobx-state-tree'
import { useRef, useState } from 'react'

import ThemeSelector from '~/components/ThemeSelector'
import DocumentArrowDown from '~/icons/DocumentArrowDown'
import DocumentArrowUp from '~/icons/DocumentArrowUp'

import { personaStore } from '~/models/PersonaStore'
import { settingStore } from '~/models/SettingStore'

import { ChatStoreSnapshotHandler } from '~/utils/transfer/ChatStoreSnapshotHandler'
import { TransferHandler } from '~/utils/transfer/TransferHandler'

const DownlodSelector = () => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [includeImages, setIncludeImages] = useState(true)

  const exportAll = async () => {
    const data = JSON.stringify({
      chatStore: await ChatStoreSnapshotHandler.formatChatStoreToExport({ includeImages }),
      personaStore: getSnapshot(personaStore),
      settingStore: getSnapshot(settingStore),
    })

    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }))
    link.download = 'llm-x-data.json'
    link.click()
  }

  return (
    <div className="mt-2 flex flex-col justify-center">
      <span className="label w-fit gap-2"> Import / Export </span>

      {/* hidden file input */}
      <input
        style={{ display: 'none' }}
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={e => TransferHandler.handleImport(e.target.files)}
      />

      <label className="label w-fit gap-2 p-0">
        <span className="label-text">Include any images in download? (increases file size):</span>

        <div className="join">
          {[true, false].map(isEnabled => (
            <button
              className={
                'btn join-item btn-sm mr-0 ' +
                (includeImages === isEnabled
                  ? 'btn-active cursor-default bg-base-300 underline underline-offset-2 '
                  : 'btn bg-base-100')
              }
              onClick={() => setIncludeImages(isEnabled)}
              key={isEnabled ? 0 : 1}
            >
              {isEnabled ? 'Yes' : 'No'}
            </button>
          ))}
        </div>
      </label>

      <div className="flex flex-row gap-2">
        <button
          className="btn btn-neutral"
          title="Import All"
          onClick={() => fileInputRef.current?.click()}
        >
          Import <DocumentArrowUp />
        </button>

        <button className="btn btn-neutral" title="Export All" onClick={exportAll}>
          Export <DocumentArrowDown />
        </button>
      </div>
    </div>
  )
}

const AppGeneralPanel = observer(() => {
  return (
    <div className="flex w-full flex-col gap-4">
      <ThemeSelector />

      <DownlodSelector />
    </div>
  )
})

export default AppGeneralPanel
