import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'

import { customFunctionStore } from '~/models/CustomFunctionStore'

import BreadcrumbBar from '~/components/BreadcrumbBar'

import FunctionTablePanel from '~/features/settings/panels/function/FunctionTablePanel'
import FunctionFormPanel from '~/features/settings/panels/function/FunctionFormPanel'

const FunctionPanel = observer(() => {
  const { selectedCustomFunction } = customFunctionStore

  const [tab, setTab] = useState<'all' | 'single'>('all')

  useEffect(() => {
    // if the model changes, go into model settings
    if (!selectedCustomFunction) {
      setTab('all')
    }
  }, [selectedCustomFunction])

  return (
    <div className="relative flex h-full w-full flex-col">
      <BreadcrumbBar
        breadcrumbs={[
          {
            label: 'Functions',
            isSelected: tab === 'all',
            onClick: () => setTab('all'),
          },
          selectedCustomFunction && {
            label: selectedCustomFunction.name,
            isSelected: tab === 'single',
            onClick: () => setTab('single'),
          },
        ]}
      />

      {tab === 'all' || !selectedCustomFunction ? (
        <FunctionTablePanel onShowDetails={() => setTab('single')} />
      ) : (
        <FunctionFormPanel selectedCustomFunction={selectedCustomFunction} />
      )}
    </div>
  )
})

export default FunctionPanel
