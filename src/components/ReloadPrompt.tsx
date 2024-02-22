import { useRegisterSW } from 'virtual:pwa-register/react'

import { toastStore } from '../models/ToastStore'
import { useEffect } from 'react'

function ReloadPrompt() {
  // return null
  // automagically replaced through vite.config.ts
  const buildDate = '__DATE__'
  // automagically replaced through vite.config.ts
  const reloadSW = '__RELOAD_SW__'

  console.log('build date: ', buildDate)

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swScriptUrl, registration) {
      console.log(`Service Worker at: ${swScriptUrl}`)
      // @ts-expect-error automagically replaced through vite.config.ts
      if (reloadSW === 'true') {
        registration &&
          setInterval(() => {
            console.log('Checking for sw update')
            registration.update()
          }, 20000 /* 20s for testing purposes */)
      } else {
        console.log('SW Registered: ' + registration)
      }
    },
    onRegisterError(error) {
      console.log('SW registration error', error)

      toastStore.addToast('Unable to create PWA', 'info')
    },
  })

  useEffect(() => {
    if (needRefresh) {
      const refreshDialog: HTMLDialogElement | null = document.getElementById(
        'pwa_refresh_modal',
      ) as HTMLDialogElement

      refreshDialog?.showModal()
    }
  }, [needRefresh])

  return (
    <dialog id="pwa_refresh_modal" className="modal modal-top">
      <div className="modal-box justify-self-center">
        <h3 className="font-bold text-lg">Updates Found, Please refresh the page</h3>

        <button className="btn btn-active mx-4" onClick={() => updateServiceWorker(true)}>
          Reload
        </button>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button onClick={() => setNeedRefresh(false)}/>
      </form>
    </dialog>
  )
}

export default ReloadPrompt
