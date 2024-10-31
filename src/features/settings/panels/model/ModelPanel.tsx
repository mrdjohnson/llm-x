import { observer } from 'mobx-react-lite'
import { useMemo, useState } from 'react'
import _ from 'lodash'
import { ScrollShadow, Tab, Tabs } from '@nextui-org/react'

import OllamaModelPanel from '~/features/settings/panels/model/OllamaModelPanel'
import A1111ModelPanel from '~/features/settings/panels/model/A1111ModelPanel'
import LmsModelPanel from '~/features/settings/panels/model/LmsModelPanel'
import OpenAiModelPanel from '~/features/settings/panels/model/OpenAiModelPanel'

import { connectionModelStore } from '~/core/connections/ConnectionModelStore'

import { settingStore } from '~/core/SettingStore'

const ModelPanel = observer(() => {
  const { selectedConnectionModelId, connections } = connectionModelStore

  const [selectedTabId, setSelectedTabId] = useState<string | undefined>(
    selectedConnectionModelId ?? connections[0]?.id,
  )

  const selectedConnection = useMemo(() => {
    return connectionModelStore.getConnectionById(selectedTabId)
  }, [selectedTabId, connections])

  return (
    <div className="flex w-full flex-col">
      {selectedTabId && (
        <>
          <ScrollShadow orientation="horizontal" className="border-b border-base-content/30">
            <Tabs
              aria-label="Options"
              variant="underlined"
              selectedKey={selectedTabId}
              onSelectionChange={key => setSelectedTabId(_.toString(key))}
              classNames={{
                tab: 'overflow-hidden flex-shrink-0 w-fit',
                tabList:
                  'gap-3 w-full flex max-w-full relative rounded-none p-0 overflow-x-scroll flex-shrink-0',
                cursor: 'group-data-[selected=true]:bg-primary w-full bg-base-content',
                tabContent:
                  'group-data-[selected=true]:text-primary group-data-[selected=true]:border-b-primary flex-shrink-0 group-[.is-active-parent]:text-primary/60',
              }}
            >
              {_.map(connections, connection => (
                <Tab
                  key={connection.id}
                  title={connection.label}
                  className={connection.id === selectedConnectionModelId ? 'is-active-parent' : ''}
                />
              ))}
            </Tabs>
          </ScrollShadow>

          {selectedConnection && (
            <div className="flex-1 overflow-y-hidden pt-2">
              <ScrollShadow className="max-h-full pb-7">
                {selectedConnection.type === 'LMS' && (
                  <LmsModelPanel connection={selectedConnection} />
                )}
                {selectedConnection.type === 'A1111' && (
                  <A1111ModelPanel connection={selectedConnection} />
                )}
                {selectedConnection.type === 'Ollama' && (
                  <OllamaModelPanel connection={selectedConnection} />
                )}
                {selectedConnection.type === 'OpenAi' && (
                  <OpenAiModelPanel connection={selectedConnection} />
                )}
              </ScrollShadow>
            </div>
          )}
        </>
      )}

      {!selectedTabId && (
        <div className="w-full text-center text-lg">
          <span className="text-lg">Add a connection in the</span>
          <button
            className="link text-lg text-primary"
            onClick={() => settingStore.openSettingsModal('general')}
          >
            General tab
          </button>
        </div>
      )}
    </div>
  )
})

export default ModelPanel
