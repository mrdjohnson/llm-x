import { ScrollShadow } from '@heroui/react'
import _ from 'lodash'

import AppGeneralPanel from '~/features/settings/panels/general/AppGeneralPanel'

const GeneralModelPanel = () => {
  return (
    <div className="flex w-full flex-col p-2">
      <div className="flex-1 overflow-y-hidden">
        <ScrollShadow className="flex h-full max-h-full w-full place-content-center">
          <AppGeneralPanel />
        </ScrollShadow>
      </div>
    </div>
  )
}

export default GeneralModelPanel
