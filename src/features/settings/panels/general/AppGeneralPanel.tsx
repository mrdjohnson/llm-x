import { observer } from 'mobx-react-lite'
import { getSnapshot } from 'mobx-state-tree'
import { useState } from 'react'

import ThemeSelector from '~/components/ThemeSelector'
import AttachmentWrapper from '~/components/AttachmentWrapper'

import DocumentArrowDown from '~/icons/DocumentArrowDown'
import DocumentArrowUp from '~/icons/DocumentArrowUp'

import { personaStore } from '~/models/PersonaStore'
import { settingStore } from '~/models/SettingStore'

import { ChatStoreSnapshotHandler } from '~/utils/transfer/ChatStoreSnapshotHandler'

const DownlodSelector = () => {
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
        <AttachmentWrapper accept=".json">
          <button className="btn btn-neutral" title="Import All">
            Import <DocumentArrowUp />
          </button>
        </AttachmentWrapper>

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
