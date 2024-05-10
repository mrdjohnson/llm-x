import { observer } from 'mobx-react-lite'
import { Fragment, useState } from 'react'

import { settingStore } from '~/models/SettingStore'

import OllamaModelPanel from '~/features/settings/panels/model/OllamaModelPanel'
import A1111ModelPanel from '~/features/settings/panels/model/A1111ModelPanel'
import LmsModelPanel from '~/features/settings/panels/model/lms/LmsModelPanel'

const Panels = [
  { title: 'Ollama', Component: OllamaModelPanel },
  { title: 'LMS', Component: LmsModelPanel },
  { title: 'A1111', Component: A1111ModelPanel },
]

const ModelPanel = observer(() => {
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
              aria-label={title}
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
