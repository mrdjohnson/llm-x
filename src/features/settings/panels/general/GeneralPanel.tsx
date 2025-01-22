import { useMemo, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { ScrollShadow, Tab, Tabs } from "@heroui/react"
import _ from 'lodash'
import { twMerge } from 'tailwind-merge'

import AppGeneralPanel from '~/features/settings/panels/general/AppGeneralPanel'

const GeneralModelPanel = observer(() => {
  const [selectedTabId, setSelectedTabId] = useState<string>('App')

  const selectedPanel = useMemo(() => {
    if (selectedTabId === 'App') {
      return <AppGeneralPanel />
    }

    return null
  }, [selectedTabId])

  return (
    <div className="flex w-full flex-col p-2">
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
          <Tab
            key="App"
            title="App"
            className={twMerge(selectedTabId === 'App' && 'is-active-parent')}
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

export default GeneralModelPanel
