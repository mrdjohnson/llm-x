// eslint-disable-next-line import/no-unresolved
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useEffect } from 'react'

const hour_1 = 60 * 60 * 1000

const usePwaReloader = () => {
  // automagically replaced through vite.config.ts
  const reloadSW = '__RELOAD_SW__'

  const {
    needRefresh: [needRefresh],
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
    // do not ask for prompt, immediately update for now
    if (needRefresh) {
      updateServiceWorker()
    }
  }, [needRefresh])

  return null
}

export default usePwaReloader
