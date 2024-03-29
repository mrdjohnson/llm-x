import { observer } from 'mobx-react-lite'

import ThemeSelector from '~/components/ThemeSelector'
import HostInput from '~/components/HostInput'

const General = observer(() => {
  return (
    <div className="flex w-full flex-col gap-4">
      <HostInput />

      <div className="mt-auto">
        <ThemeSelector />
      </div>
    </div>
  )
})

export default General
