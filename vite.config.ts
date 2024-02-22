import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA, VitePWAOptions } from 'vite-plugin-pwa'
import mkcert from 'vite-plugin-mkcert'
import replace from '@rollup/plugin-replace'

const replaceOptions = { __DATE__: new Date().toISOString(), __RELOAD_SW__: 'false' }

const isDev = process.env.NODE_ENV === 'development'

const makeCert = isDev ? mkcert() : undefined

const pwaOptions: Partial<VitePWAOptions> = {
  mode: 'development',
  base: '/llm-x/',
  includeAssets: ['favicon.svg'],
  workbox: {
    globPatterns: ['**/*'],
  },
  manifest: {
    name: 'LLM-X Dev Version',
    short_name: 'LLM-X_dev',
    theme_color: '#ffffff',
    display: 'standalone',
    icons: [
      {
        src: 'pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  },
  devOptions: {
    enabled: isDev,
    type: 'module',
    navigateFallback: 'index.html',
  },
}

const reload = process.env.RELOAD_SW === 'true'
const selfDestroying = process.env.SW_DESTROY === 'true'

if (process.env.SW === 'true' && pwaOptions.manifest) {
  pwaOptions.manifest.name = 'LLM-X'
  pwaOptions.manifest.short_name = 'LLM-X'
}

if (reload) {
  replaceOptions.__RELOAD_SW__ = 'true'
}

if (selfDestroying) pwaOptions.selfDestroying = selfDestroying

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), makeCert, VitePWA(pwaOptions), replace(replaceOptions)],
  base: '/llm-x/',
})
