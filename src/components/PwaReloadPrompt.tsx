import { useRegisterSW } from 'virtual:pwa-register/react'
import useMedia from 'use-media'
import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'

const hour_1 = 60 * 60 * 1000

const PwaReloadPrompt = observer(() => {
  // automagically replaced through vite.config.ts
  const reloadSW = '__RELOAD_SW__'

  //   this means we're in app mode
  const isStandalone = useMedia('(display-mode: standalone)')

  console.log('isStandalone', isStandalone)

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
    // settingStore.setPwaNeedsUpdate(needRefresh, updateServiceWorker)

    // do not ask for prompt, immediately update for now
    if (needRefresh) {
      updateServiceWorker()
    }
  }, [needRefresh])

  return null
})

export default PwaReloadPrompt
