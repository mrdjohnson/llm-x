import Github from '~/icons/Github'

import { SideBar } from '~/containers/SideBar'

const MobileSplashPanel = () => {
  return (
    <div className="flex h-full min-h-7 w-full flex-col justify-stretch gap-2">
      <div className="flex w-full flex-row gap-2">
        <a
          href="https://github.com/mrdjohnson/llm-x"
          className="btn btn-outline btn-neutral mt-auto flex-1 fill-base-content stroke-base-content hover:fill-primary-content"
          aria-label="LLM-X's Github"
          target="__blank"
        >
          <Github />
        </a>
      </div>

      <div className="flex-1 self-stretch overflow-scroll">
        <SideBar />
      </div>
    </div>
  )
}

export default MobileSplashPanel
