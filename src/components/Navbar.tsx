import { NavLink } from 'react-router-dom'

import ModelSelector from '~/components/ModelSelector'
import PersonaSelector from '~/components/PersonaSelector'
import ModelRefreshButton from '~/components/ModelRefreshButton'
import FunTitle from '~/components/FunTitle'
import KeyboardTooltip from '~/components/KeyboardToolTip'
import { twMerge } from 'tailwind-merge'
import KnowledgePopoverForm from '~/components/KnowledgePopoverForm'

import Bars3 from '~/icons/Bars3'
import Search from '~/icons/Search'
import AppSettings from '~/icons/AppSettings'
import ShrinkHorizontal from '~/icons/ShrinkHorizontal'
import Create from '~/icons/Create'
import Database from '~/icons/Database'

import { settingStore } from '~/core/setting/SettingStore'
import { chatStore } from '~/core/chat/ChatStore'
import { Divider, Input, PopoverTrigger } from '@heroui/react'
import { knowledgeStore } from '~/core/knowledge/KnowledgeStore'

const Navbar = () => {
  const isSidebarOpen = settingStore.setting.isSidebarOpen

  return (
    <div className="mb-2 flex h-auto min-h-0 flex-row justify-between gap-3 p-1 md:mb-0 md:flex-col md:p-0">
      <div className=" hidden items-center md:flex md:text-xl">
        {isSidebarOpen && (
          <KeyboardTooltip
            command="$mod+B"
            placement="bottom"
            showArrow={false}
            className="-mt-2"
            title="Toggle Sidebar"
          >
            <button
              className="absolute left-2 text-base-content/30 transition-colors duration-100 ease-in-out hover:text-base-content/80"
              onClick={() => settingStore.toggleSideBar()}
            >
              <ShrinkHorizontal />
            </button>
          </KeyboardTooltip>
        )}

        <FunTitle className="w-full text-balance text-center md:text-xl" allowFun={isSidebarOpen} />
      </div>

      {isSidebarOpen ? (
        <>
          <div className="w-full max-w-[600px] flex-row gap-2 md:flex md:flex-1">
            <ModelSelector />
            <ModelRefreshButton />
          </div>

          <PersonaSelector />
        </>
      ) : (
        <Divider className="bg-base-content/15" />
      )}

      <div
        className={twMerge(
          'flex w-fit gap-2 md:w-full ',
          settingStore.setting.isSidebarOpen
            ? 'flex-row md:justify-evenly'
            : 'flex-col items-center',
        )}
      >
        <KeyboardTooltip
          command="$mod+Shift+O"
          placement="bottom"
          showArrow={false}
          className="-mt-2"
          title="New Chat"
        >
          <button
            className="group btn btn-square btn-ghost btn-sm !bg-transparent text-base-content/60 md:btn-md hover:text-base-content md:flex"
            onClick={() => chatStore.createChat()}
          >
            <Create className="size-6" />
          </button>
        </KeyboardTooltip>

        {/* <KnowledgePopoverForm> */}
        {/* needed for the tooltip to attach to */}
        <div>
          <KeyboardTooltip
            command="$mod+Shift+W"
            placement="bottom"
            showArrow={false}
            className="-mt-2"
            title="Add knowledge"
            // onClick={() =>
            //   knowledgeStore.createVectorStoreFromUrl(
            //     'https://www.imdb.com/name/nm0000226/bio/?ref_=nm_ov_bio_sm',
            //   )
            // }
          >
            <button
              className={twMerge(
                'btn btn-square btn-sm !bg-transparent text-base-content opacity-60 md:btn-md hover:opacity-100',
                knowledgeStore.documentStatus.isDocumentsLoaded && 'text-primary',
              )}
              onClick={() => {
                knowledgeStore.listen()
                knowledgeStore.toggleActive()
              }}
            >
              <Database />
            </button>
          </KeyboardTooltip>
        </div>
        {/* </KnowledgePopoverForm> */}

        <KeyboardTooltip
          command="$mod+K"
          placement="bottom"
          showArrow={false}
          className="-mt-2 ml-auto"
          title="Search"
        >
          <NavLink
            to="search"
            className="btn btn-square btn-ghost btn-md hidden !bg-transparent text-base-content/60 hover:text-base-content md:flex"
          >
            <Search />
          </NavLink>
        </KeyboardTooltip>

        <KeyboardTooltip
          command="$mod+/"
          placement="bottom"
          showArrow={false}
          className="mt-auto"
          title="Settings"
        >
          <NavLink
            to="initial"
            className="btn btn-square btn-ghost btn-sm min-w-0 !bg-transparent text-base-content/60 md:btn-md hover:text-base-content"
          >
            <div className="swap md:swap-active">
              <div className="swap-on align-middle">
                <AppSettings />
              </div>

              <div className="swap-off">
                <Bars3 />
              </div>
            </div>
          </NavLink>
        </KeyboardTooltip>
      </div>
    </div>
  )
}

export default Navbar
