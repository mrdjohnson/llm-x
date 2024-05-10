import { observer } from 'mobx-react-lite'
import { useKBar } from 'kbar'

import Github from '~/icons/Github'
import Search from '~/icons/Search'

import { SideBar } from '~/containers/SideBar'
import { settingStore } from '~/models/SettingStore'

const MobileSplashPanel = observer(() => {
  const { query } = useKBar()

  const handleQuickSearchClicked = () => {
    settingStore.closeSettingsModal()

    query.toggle()
  }

  return (
    <div className=" flex min-h-7 w-full flex-col justify-stretch gap-2">
      <div className="flex w-full flex-row gap-2">
        <button className="btn btn-outline flex-1" onClick={handleQuickSearchClicked}>
          <Search /> Quick Search
        </button>

        <a
          href="https://github.com/mrdjohnson/llm-x"
          className="btn btn-outline btn-neutral mt-auto flex-1 fill-base-content stroke-base-content hover:fill-primary-content"
          aria-label="LLM-X's Github"
          target='__blank'
        >
          <Github />
        </a>
      </div>

      <div className="flex-1 self-stretch overflow-scroll">
        <SideBar />
      </div>
    </div>
  )
})

export default MobileSplashPanel
