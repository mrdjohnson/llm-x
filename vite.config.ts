import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA, VitePWAOptions } from 'vite-plugin-pwa'
import mkcert from 'vite-plugin-mkcert'
import replace from '@rollup/plugin-replace'
import removeConsole from 'vite-plugin-remove-console'
import tsconfigPaths from 'vite-tsconfig-paths'

const replaceOptions = { __DATE__: new Date().toISOString(), __RELOAD_SW__: 'false' }

const isDev = process.env.NODE_ENV === 'development'
const isStaging = process.env.NODE_ENV === 'staging'

const makeCert = isDev || isStaging ? mkcert({ hosts: ['0.0.0.0'] }) : undefined

const pwaOptions: Partial<VitePWAOptions> = {
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

const reload = process.env.RELOAD_SW === 'true'
const selfDestroying = process.env.SW_DESTROY === 'true'

if (!isDev && pwaOptions.manifest) {
  if (isStaging) {
    pwaOptions.manifest.name = 'LLM-X local'
    pwaOptions.manifest.short_name = 'LLM-X local'
  } else {
    pwaOptions.manifest.name = 'LLM-X prod'
    pwaOptions.manifest.short_name = 'LLM-X'
  }
}

if (reload) {
  replaceOptions.__RELOAD_SW__ = 'true'
}

if (selfDestroying) pwaOptions.selfDestroying = selfDestroying

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    makeCert,
    VitePWA(pwaOptions),
    replace(replaceOptions),
    removeConsole(),
    tsconfigPaths(),
  ],
  esbuild: {
    // https://github.com/vitejs/vite/discussions/7920#discussioncomment-2709119
    drop: isDev ? [] : ['console', 'debugger'],
    logLevel: 'silent',
  },
  base: '/llm-x/',
  worker: {
    rollupOptions: {
      logLevel: 'silent',
    },
  },
  preview: {
    port: 3030,
    strictPort: true,
    cors: true,
    // @ts-expect-error https allows booleans
    https: true,
  },
  server: {
    strictPort: true,
    host: true,
    // @ts-expect-error https allows booleans
    https: true,
    origin: isStaging ? 'http://0.0.0.0:3030' : 'http://0.0.0.0',
  },
})
