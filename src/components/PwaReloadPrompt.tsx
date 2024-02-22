import { useRegisterSW } from 'virtual:pwa-register/react'
import useMedia from 'use-media'
import { useEffect } from 'react'

const hour_1 = 60 * 60 * 1000

const PwaReloadPrompt = () => {
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
      <div className="modal-box relative m-8 flex w-fit max-w-[600px] flex-row items-center justify-self-center rounded-md">
        <h3 className="text-lg font-bold">Updates Found, Please refresh the page</h3>

        <div className="btn btn-neutral btn-sm mx-4" onClick={() => updateServiceWorker(true)}>
          Refresh
        </div>

        <div
          className="btn btn-xs absolute right-1 top-1 text-sm font-bold opacity-50"
          onClick={() => setNeedRefresh(false)}
        >
          x
        </div>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button onClick={() => setNeedRefresh(false)} />
      </form>
    </dialog>
  )
}

export default PwaReloadPrompt
