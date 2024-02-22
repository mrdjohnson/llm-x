// https://vite-pwa-org.netlify.app/guide/periodic-sw-updates.html#handling-edge-cases

import { registerSW } from 'virtual:pwa-register'

const hour_1 = 60 * 60 * 1000

registerSW({
  onRegistered(registration) {
    registration &&
      setInterval(() => {
        registration.update()
      }, hour_1)
  },

  onOfflineReady() {},
  onNeedRefresh() {},
})
