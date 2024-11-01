import { useEffect, useMemo, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { ScrollShadow, Tab, Tabs } from '@nextui-org/react'
import _ from 'lodash'

import NewConnectionPanel from '~/features/settings/panels/connections/NewConnectionPanel'

import { connectionStore } from '~/core/connection/ConnectionStore'
import ConnectionPanel from '~/features/settings/panels/connections/ConnectionPanel'

const ConnectionsPanel = observer(() => {
  const { selectedConnectionModelId, connections } = connectionStore

  const [selectedTabId, setSelectedTabId] = useState<string>(selectedConnectionModelId ?? 'App')

  useEffect(() => {
    setSelectedTabId(selectedConnectionModelId ?? 'App')
  }, [selectedConnectionModelId])

  const selectedPanel = useMemo(() => {
    if (selectedTabId === 'new_connection') {
      return <NewConnectionPanel />
    }

    const connection = connectionStore.getConnectionById(selectedTabId)

    if (connection) {
      return <ConnectionPanel connection={connection} />
    }

    setSelectedTabId('new_connection')

    return null
  }, [selectedTabId, connections])

  return (
    <div className="flex w-full flex-col">
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

          <Tab
            key="new_connection"
            title="New Connection +"
            className={selectedConnectionModelId === 'new_connection' ? 'is-active-parent' : ''}
          />
        </Tabs>
      </ScrollShadow>

      {selectedPanel && (
        <div className="flex-1 overflow-y-hidden pt-2">
          <ScrollShadow className="flex h-full max-h-full w-full place-content-center">
            {selectedPanel}
          </ScrollShadow>
        </div>
      )}
    </div>
  )
})

export default ConnectionsPanel
