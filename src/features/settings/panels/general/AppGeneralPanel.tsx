import { observer } from 'mobx-react-lite'

import ThemeSelector from '~/components/ThemeSelector'

const AppGeneralPanel = observer(() => {
  return (
    <div className="flex w-full flex-col gap-4">
      <ThemeSelector />
    </div>
  )
})

export default AppGeneralPanel
