import { VitePWA, VitePWAOptions } from 'vite-plugin-pwa'
import mkcert from 'vite-plugin-mkcert'

const isDev = process.env.NODE_ENV === 'development'

const makeCert = isDev ? mkcert() : undefined

export const pwaOptions: Partial<VitePWAOptions> = {
  mode: 'production',
  base: '/llm-x/',
  includeAssets: ['favicon.svg'],
  workbox: {
    globPatterns: ['**/*'],
    disableDevLogs: true,
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

if (process.env.SW === 'true' && pwaOptions.manifest) {
  pwaOptions.manifest.name = 'LLM-X'
  pwaOptions.manifest.short_name = 'LLM-X'
}

if (process.env.SW_DESTROY === 'true') pwaOptions.selfDestroying = true

export const pwaPlugins = [makeCert, VitePWA(pwaOptions)]
