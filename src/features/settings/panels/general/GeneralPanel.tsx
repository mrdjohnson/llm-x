import { ScrollArea } from '@mantine/core'
import _ from 'lodash'

import AppGeneralPanel from '~/features/settings/panels/general/AppGeneralPanel'

const GeneralModelPanel = () => {
  return (
    <div className="flex w-full flex-col p-2">
      <div className="flex-1 overflow-y-hidden">
        <ScrollArea className="flex h-full max-h-full w-full place-content-center">
          <AppGeneralPanel />
        </ScrollArea>
      </div>
    </div>
  )
}

export default GeneralModelPanel
