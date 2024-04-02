import { observer } from 'mobx-react-lite'
import { useState } from 'react'

import { settingStore } from '~/models/SettingStore'

import AppGeneralPanel from '~/features/settings/panels/general/AppGeneralPanel'
import OllamaGeneralPanel from '~/features/settings/panels/general/OllamaGeneralPanel'
import A1111GeneralPanel from '~/features/settings/panels/general/A1111GeneralPanel'

const Panels = [
  { title: 'App', Component: AppGeneralPanel },
  { title: 'Ollama', Component: OllamaGeneralPanel },
  { title: 'A1111', Component: A1111GeneralPanel },
]

const GeneralModelPanel = observer(() => {
  const { selectedModelType } = settingStore

  const [selectedTab, setSelectedTab] = useState(selectedModelType)

  return (
    <div className="flex w-full flex-col">
      <div
        role="tablist"
        className="tabs tabs-lifted -tabs-bordered flex-1 overflow-y-hidden"
        style={{ gridTemplateRows: 'max-content auto' }}
      >
        {Panels.map(({ title, Component }) => (
          <>
            <input
              type="radio"
              role="tab"
              className={
                'tab h-fit gap-2 border-base-content/45 ' +
                (title === selectedTab
                  ? ' [--tab-border-color:var(--fallback-bc,oklch(var(--bc)/0.45))] '
                  : ' [--tab-border-color:transparent] ')
              }
              aria-label={title}
              checked={title === selectedTab}
              onChange={() => setSelectedTab(title)}
            />

            <div
              role="tabpanel"
              className="tab-content h-full self-stretch overflow-scroll rounded-md border-base-content/45 bg-base-100 p-2"
            >
              <Component />
            </div>
          </>
        ))}
      </div>
    </div>
  )
})

export default GeneralModelPanel
