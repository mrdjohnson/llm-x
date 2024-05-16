import { observer } from 'mobx-react-lite'
import { Fragment, JSX, useState } from 'react'

import { ConnectionTypes, settingStore } from '~/models/SettingStore'

import AppGeneralPanel from '~/features/settings/panels/general/AppGeneralPanel'
import OllamaGeneralPanel from '~/features/settings/panels/general/OllamaGeneralPanel'
import A1111GeneralPanel from '~/features/settings/panels/general/A1111GeneralPanel'
import LmsGeneralPanel from '~/features/settings/panels/general/LmsGeneralPanel'

type PanelTypes = ConnectionTypes | 'App'

const Panels: Array<{ title: PanelTypes; label?: string, Component: () => JSX.Element }> = [
  { title: 'App', Component: AppGeneralPanel },
  { title: 'Ollama', Component: OllamaGeneralPanel },
  { title: 'LMS', label: 'LM Studio', Component: LmsGeneralPanel },
  { title: 'A1111', Component: A1111GeneralPanel },
]

const GeneralModelPanel = observer(() => {
  const { modelType: selectedModelType } = settingStore

  const [selectedTab, setSelectedTab] = useState<PanelTypes>(selectedModelType)

  return (
    <div className="flex w-full flex-col">
      <div
        role="tablist"
        className="tabs tabs-lifted -tabs-bordered flex-1 overflow-y-hidden"
        style={{ gridTemplateRows: 'max-content auto' }}
      >
        {Panels.map(({ title, label, Component }) => (
          <Fragment key={title}>
            <input
              type="radio"
              role="tab"
              className={
                'tab h-fit gap-2 border-base-content/45 ' +
                (title === selectedTab
                  ? ' [--tab-border-color:var(--fallback-bc,oklch(var(--bc)/0.45))] '
                  : ' [--tab-border-color:transparent] ')
              }
              aria-label={label || title}
              checked={title === selectedTab}
              onChange={() => setSelectedTab(title)}
            />

            <div
              role="tabpanel"
              className="tab-content h-full self-stretch overflow-scroll rounded-md border-base-content/45 bg-base-100 p-2"
            >
              <Component />
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  )
})

export default GeneralModelPanel
