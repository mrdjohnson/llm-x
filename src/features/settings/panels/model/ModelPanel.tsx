import { observer } from 'mobx-react-lite'
import { useEffect, useMemo, useState } from 'react'
import _ from 'lodash'
import { ScrollShadow, Tab, Tabs } from '@nextui-org/react'

import OllamaModelPanel from '~/features/settings/panels/model/OllamaModelPanel'
import A1111ModelPanel from '~/features/settings/panels/model/A1111ModelPanel'
import LmsModelPanel from '~/features/settings/panels/model/LmsModelPanel'
import OpenAiModelPanel from '~/features/settings/panels/model/OpenAiModelPanel'
import GeminiModelPanel from '~/features/settings/panels/model/GeminiModelPanel'

import { connectionStore } from '~/core/connection/ConnectionStore'
import { settingStore } from '~/core/setting/SettingStore'

const ModelPanel = observer(() => {
  const { selectedConnection, connections } = connectionStore
  const { modelPanelConnectionId } = settingStore

  const [selectedTabId, setSelectedTabId] = useState<string | undefined>(
    modelPanelConnectionId ?? selectedConnection?.id ?? connections[0]?.id,
  )

  const connection = useMemo(() => {
    return connectionStore.getConnectionById(selectedTabId)
  }, [selectedTabId, connections])

  useEffect(() => {
    settingStore.setModelPanelOverride(undefined)
  }, [])

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
                  className={connection.id === selectedConnection?.id ? 'is-active-parent' : ''}
                />
              ))}
            </Tabs>
          </ScrollShadow>

          {connection && (
            <div className="flex-1 overflow-y-hidden pt-2">
              <ScrollShadow className="max-h-full pb-7">
                {connection.type === 'LMS' && <LmsModelPanel connection={connection} />}
                {connection.type === 'A1111' && <A1111ModelPanel connection={connection} />}
                {connection.type === 'Ollama' && <OllamaModelPanel connection={connection} />}
                {connection.type === 'OpenAi' && <OpenAiModelPanel connection={connection} />}
                {connection.type === 'Gemini' && <GeminiModelPanel connection={connection} />}
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
