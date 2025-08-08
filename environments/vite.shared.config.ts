/* eslint-disable @typescript-eslint/no-restricted-imports */
/// <reference types="vitest/config" />

import { PluginOption, UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import replace from '@rollup/plugin-replace'
import removeConsole from 'vite-plugin-remove-console'
import tsconfigPaths from 'vite-tsconfig-paths'
import { comlink } from 'vite-plugin-comlink'
import observerPlugin from 'mobx-react-observer/babel-plugin'

import { pwaPlugins } from './pwa/pwa.vite'
import { chromePlugins } from './chrome/chrome.vite'
import { firefoxPlugins } from './firefox/firefox.vite'

import platformResolver from '../lib/vite-plugin-platform-resolver/plugin'

const replaceOptions = { __DATE__: new Date().toISOString(), __RELOAD_SW__: 'false' }

const isDev = process.env.NODE_ENV === 'development'
const isTest = process.env.NODE_ENV === 'test'

const PLATFORM = process.env.PLATFORM || 'pwa'
const PLATFORM_IS_PWA = PLATFORM === 'pwa'

let platformPlugins: PluginOption[] = []

if (PLATFORM === 'pwa') {
  platformPlugins = pwaPlugins
} else if (PLATFORM === 'chrome') {
  platformPlugins = chromePlugins()
} else if (PLATFORM === 'firefox') {
  platformPlugins = firefoxPlugins()
}

const reload = process.env.RELOAD_SW === 'true'

if (reload) {
  replaceOptions.__RELOAD_SW__ = 'true'
}

// https://vitejs.dev/config/
export const sharedConfig: UserConfig = {
  define: {
    __PLATFORM__: JSON.stringify(PLATFORM),
  },
  build: {
    outDir: PLATFORM_IS_PWA ? './dist' : `./environments/${PLATFORM}/dist`,
    emptyOutDir: true,
    rollupOptions: { external: PLATFORM_IS_PWA ? undefined : ['virtual:pwa-register/react'] },
  },
  plugins: [
    comlink(),
    react({
      babel: {
        plugins: [observerPlugin()],
      },
    }),
    platformPlugins,
    // @ts-expect-error this was part of the original setup, it works but probably needs to be updated
    replace(replaceOptions),
    removeConsole(),
    tsconfigPaths(),
    platformResolver(PLATFORM), // must happen after tsconfigPaths
  ],
  esbuild: {
    // https://github.com/vitejs/vite/discussions/7920#discussioncomment-2709119
    drop: isDev || isTest ? [] : ['console', 'debugger'],
    logLevel: 'silent',
  },
  worker: {
    rollupOptions: {
      logLevel: 'silent',
    },
    plugins: () => [comlink()],
  },
}
