/* eslint-disable @typescript-eslint/no-restricted-imports */

import { defineConfig, PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import replace from '@rollup/plugin-replace'
import removeConsole from 'vite-plugin-remove-console'
import tsconfigPaths from 'vite-tsconfig-paths'
import { comlink } from 'vite-plugin-comlink'

import { pwaPlugins } from './environments/pwa/pwa.vite'
import { chromePlugins } from './environments/chrome/chrome.vite'

const replaceOptions = { __DATE__: new Date().toISOString(), __RELOAD_SW__: 'false' }

const isDev = process.env.NODE_ENV === 'development'

const TARGET = process.env.TARGET || 'pwa'
const TARGET_IS_PWA = TARGET === 'pwa'

let targetPlugins: PluginOption[] = []

if (TARGET === 'pwa') {
  targetPlugins = pwaPlugins
} else if (TARGET === 'chrome') {
  targetPlugins = chromePlugins()
}

const reload = process.env.RELOAD_SW === 'true'

if (reload) {
  replaceOptions.__RELOAD_SW__ = 'true'
}

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __TARGET__: JSON.stringify(TARGET),
  },
  plugins: [
    comlink(),
    react(),
    targetPlugins,
    replace(replaceOptions),
    removeConsole(),
    tsconfigPaths(),
  ],
  esbuild: {
    // https://github.com/vitejs/vite/discussions/7920#discussioncomment-2709119
    drop: isDev ? [] : ['console', 'debugger'],
    logLevel: 'silent',
  },
  build: {
    outDir: TARGET_IS_PWA ? './dist' : `./environments/${TARGET}/dist`,
    emptyOutDir: true,
    rollupOptions: { external: TARGET_IS_PWA ? undefined : ['virtual:pwa-register/react'] },
  },
  base: TARGET_IS_PWA ? '/llm-x/' : undefined,
  worker: {
    rollupOptions: {
      logLevel: 'silent',
    },
    plugins: () => [comlink()],
  },
  preview: {
    port: 5173,
    strictPort: true,
    host: true,
    cors: true,
  },
})
