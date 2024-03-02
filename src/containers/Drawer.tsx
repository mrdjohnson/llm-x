import { observer } from 'mobx-react-lite'
import { ChangeEvent, FormEvent, Suspense, useEffect, useState } from 'react'

import Question from '../icons/Question'
import Github from '../icons/Github'

import { DefaultHost, settingStore } from '../models/SettingStore'
import ModelRefreshButton from '../components/ModelRefreshButton'

import ModelSelector from '../components/ModelSelector'
import ThemeSelector from '../components/ThemeSelector'
import { SideBar } from './SideBar'

const Input = observer(() => {
  const [hostChanged, setHostChanged] = useState(false)
  const hasServer = !!settingStore.selectedModel

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    settingStore.setHost(e.target.value)
    setHostChanged(true)
  }

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    settingStore.updateModels()
  }

  useEffect(() => {
    if (hasServer) {
      setHostChanged(false)
    }
  }, [hasServer])

  return (
    <form className="form-control" onSubmit={handleFormSubmit}>
      <div className="label pb-1 pt-0">
        <span className="label-text flex flex-row items-center gap-2 text-sm">
          Host:
          <div
            className="cursor-pointer"
            onClick={() => settingStore.openUpdateModal({ fromUser: true })}
          >
            <Question />
          </div>
        </span>
      </div>

      <div className="flex flex-row items-center gap-2">
        <input
          type="text"
          id="host"
          className="input input-bordered w-full"
          placeholder={DefaultHost}
          defaultValue={settingStore.host}
          onChange={handleInputChange}
        />

        <ModelRefreshButton small shouldShow={hostChanged} />
      </div>
    </form>
  )
})

const Models = () => {
  return (
    <div className="form-control">
      <div className="label pb-1 pt-0">
        <span className="label-text text-sm">Model:</span>
      </div>

      <ModelSelector />
    </div>
  )
}

const Drawer = () => {
  return (
    <>
      <input id="app-drawer" type="checkbox" className="drawer-toggle" />

      <section className="drawer-side z-20">
        <label htmlFor="app-drawer" aria-label="close sidebar" className="drawer-overlay" />

        <div className="flex max-h-dvh min-h-full w-80 flex-col overflow-hidden bg-base-200 p-3">
          <div className="navbar" />
          <div className="flex h-full max-h-full flex-shrink-0 flex-col gap-3 lg:flex-1">
            <Input />

            <Suspense fallback={<div> Loading models ... </div>}>
              <Models />
            </Suspense>

            <ThemeSelector />
          </div>

          <div className="flex flex-1 rounded-md bg-base-300 lg:hidden mt-3 overflow-hidden">
            <SideBar />
          </div>

          <a
            href="https://github.com/mrdjohnson/llm-x"
            className="btn btn-outline btn-neutral mt-3 flex-shrink-0 fill-base-content stroke-base-content hover:fill-primary-content"
            aria-label="LLM-X's Github"
          >
            <Github />
          </a>
        </div>
      </section>
    </>
  )
}

export default Drawer
