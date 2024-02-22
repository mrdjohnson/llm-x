import { observer } from 'mobx-react-lite'
import { Suspense, } from 'react'

import Question from '../icons/Question'
import Refresh from '../icons/Refresh'

import { DefaultHost, settingStore } from '../models/SettingStore'

import ModalSelector from './ModalSelector'
import ThemeSelector from './ThemeSelector'
import { SideBar } from './SideBar'

const openNoServerDialog = () => {
  const noServerDialog: HTMLDialogElement | undefined = document.getElementById(
    'no-server-modal',
  ) as HTMLDialogElement

  noServerDialog?.showModal()
}

const Input = observer(() => {
  const noServer = !settingStore.selectedModel

  return (
    <div className="form-control">
      <div className="label pb-1 pt-0">
        <span className="label-text text-sm flex flex-row items-center gap-2">
          Host:
          <div className="cursor-pointer" onClick={openNoServerDialog}>
            <Question />
          </div>
        </span>
      </div>

      <div className="flex flex-row gap-2 items-center">
        <input
          type="text"
          id="host"
          className="input input-bordered w-full placeholder:opacity-30"
          placeholder={DefaultHost}
          defaultValue={settingStore.host}
          onChange={e => settingStore.setHost(e.target.value)}
        />

        {noServer && (
          <button
            className="btn btn-ghost align-middle px-2"
            onClick={() => settingStore.updateModels()}
          >
            <Refresh />
          </button>
        )}
      </div>
    </div>
  )
})

const Models = observer(() => {

  return (
    <div className="form-control">
      <div className="label pb-1 pt-0">
        <span className="label-text text-sm">Model:</span>
      </div>

      <ModalSelector />
    </div>
  )
})

const Drawer = () => {
  return (
    <>
      <input id="app-drawer" type="checkbox" className="drawer-toggle" />

      <section className="drawer-side z-20">
        <label htmlFor="app-drawer" aria-label="close sidebar" className="drawer-overlay" />

        <div className="p-3 w-80 min-h-full bg-base-200 flex flex-col">
          <div className="navbar" />
          <div className="flex flex-col gap-3 flex-1 h-full">
            <Input />

            <Suspense fallback={<div> Loading models ... </div>}>
              <Models />
            </Suspense>

            <ThemeSelector />

            <div className="lg:hidden h-full flex-1 flex bg-base-300 rounded-md flex">
              <SideBar />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Drawer
