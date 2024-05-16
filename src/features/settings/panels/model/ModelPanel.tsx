import { observer } from 'mobx-react-lite'
import { Fragment, JSX, useState } from 'react'

import { ConnectionTypes, settingStore } from '~/models/SettingStore'

import OllamaModelPanel from '~/features/settings/panels/model/OllamaModelPanel'
import A1111ModelPanel from '~/features/settings/panels/model/A1111ModelPanel'
import LmsModelPanel from '~/features/settings/panels/model/lms/LmsModelPanel'

const Panels: Array<{ title: ConnectionTypes; label?: string; Component: () => JSX.Element }> = [
  { title: 'Ollama', Component: OllamaModelPanel },
  { title: 'LMS', label: 'LM Studio', Component: LmsModelPanel },
  { title: 'A1111', Component: A1111ModelPanel },
]

const ModelPanel = observer(() => {
  const { modelType: selectedModelType } = settingStore

  const [selectedTab, setSelectedTab] = useState<ConnectionTypes>(selectedModelType)

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
                  : ' [--tab-border-color:transparent] ') +
                (title === selectedModelType ? ' text-primary ' : '  ')
              }
              aria-label={label || title}
              checked={title === selectedTab}
              onChange={() => setSelectedTab(title)}
              key={title}
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

export default ModelPanel
