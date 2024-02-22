import { observer } from 'mobx-react-lite'
import { Suspense } from 'react'

import Question from '../icons/Question'

import { DefaultHost, settingStore } from '../models/SettingStore'
import ModelRefreshButton from './ModelRefreshButton'

import ModalSelector from './ModalSelector'
import ThemeSelector from './ThemeSelector'
import { SideBar } from './SideBar'

const openNoServerDialog = () => {
  const noServerDialog: HTMLDialogElement | undefined = document.getElementById(
    'help-modal',
  ) as HTMLDialogElement

  noServerDialog?.showModal()
}

const Input = observer(() => {
  return (
    <div className="form-control">
      <div className="label pb-1 pt-0">
        <span className="label-text flex flex-row items-center gap-2 text-sm">
          Host:
          <div className="cursor-pointer" onClick={openNoServerDialog}>
            <Question />
          </div>
        </span>
      </div>

      <div className="flex flex-row items-center gap-2">
        <input
          type="text"
          id="host"
          className="input input-bordered w-full placeholder:opacity-30"
          placeholder={DefaultHost}
          defaultValue={settingStore.host}
          onChange={e => settingStore.setHost(e.target.value)}
        />

        <ModelRefreshButton small />
      </div>
    </div>
  )
})

const Models = () => {
  return (
    <div className="form-control">
      <div className="label pb-1 pt-0">
        <span className="label-text text-sm">Model:</span>
      </div>

      <ModalSelector />
    </div>
  )
}

const Drawer = () => {
  return (
    <>
      <input id="app-drawer" type="checkbox" className="drawer-toggle" />

      <section className="drawer-side z-20">
        <label htmlFor="app-drawer" aria-label="close sidebar" className="drawer-overlay" />

        <div className="flex min-h-full w-80 flex-col bg-base-200 p-3">
          <div className="navbar" />
          <div className="flex h-full flex-1 flex-col gap-3">
            <Input />

            <Suspense fallback={<div> Loading models ... </div>}>
              <Models />
            </Suspense>

            <ThemeSelector />

            <div className="flex h-full flex-1 rounded-md bg-base-300 lg:hidden">
              <SideBar />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Drawer
