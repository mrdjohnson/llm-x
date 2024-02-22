import { useRegisterSW } from 'virtual:pwa-register/react'
import useMedia from 'use-media'
import { useEffect } from 'react'

const hour_1 = 60 * 60 * 1000

function ReloadPrompt() {
  // automagically replaced through vite.config.ts
  const reloadSW = '__RELOAD_SW__'

  //   this means we're in app mode
  const isStandalone = useMedia('(display-mode: standalone)')

  console.log('isStandalone', isStandalone)

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swScriptUrl, registration) {
      console.log(`Service Worker at: ${swScriptUrl}`)

      // @ts-expect-error automagically replaced through vite.config.ts
      if (reloadSW === 'true') {
        if (registration) {
          // update registration every hour
          setInterval(() => {
            console.log('updating registration')

            registration.update()
          }, hour_1)
        }
      } else {
        console.log('SW Registered: ' + registration)
      }
    },

    onRegisterError(error) {
      console.log('SW registration error', error)
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

  if (!isStandalone) return null

  return (
    <dialog id="pwa_refresh_modal" className="modal modal-top">
      <div className="modal-box justify-self-center">
        <h3 className="font-bold text-lg">Updates Found, Please refresh the page</h3>

        <button className="btn btn-active mx-4" onClick={() => updateServiceWorker(true)}>
          Reload
        </button>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button onClick={() => setNeedRefresh(false)} />
      </form>
    </dialog>
  )
}

export default ReloadPrompt
