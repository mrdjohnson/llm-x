/* eslint-disable @typescript-eslint/no-restricted-imports */
/// <reference types="vitest/config" />

import { defineConfig, PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import replace from '@rollup/plugin-replace'
import removeConsole from 'vite-plugin-remove-console'
import tsconfigPaths from 'vite-tsconfig-paths'
import { comlink } from 'vite-plugin-comlink'
import observerPlugin from 'mobx-react-observer/babel-plugin'

import { pwaPlugins } from './environments/pwa/pwa.vite'
import { chromePlugins } from './environments/chrome/chrome.vite'
import { firefoxPlugins } from './environments/firefox/firefox.vite'

import platformResolver from './lib/vite-plugin-platform-resolver/plugin'

const COVERAGE_PERCENTAGE = 50

const replaceOptions = { __DATE__: new Date().toISOString(), __RELOAD_SW__: 'false' }

console.log('env: ', import.meta.env)

const isProd = process.env.NODE_ENV === 'production'
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
export default defineConfig({
  define: {
    __PLATFORM__: JSON.stringify(PLATFORM),
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
    isProd && removeConsole(),
    tsconfigPaths(),
    platformResolver(PLATFORM), // must happen after tsconfigPaths
  ],
  esbuild: {
    // https://github.com/vitejs/vite/discussions/7920#discussioncomment-2709119
    // todo: remove this when done with testing
    // drop: isDev || isTest ? [] : ['console', 'debugger'],
    // logLevel: 'silent',
  },
  build: {
    outDir: PLATFORM_IS_PWA ? './dist' : `./environments/${PLATFORM}/dist`,
    emptyOutDir: true,
    rollupOptions: {
      external: PLATFORM_IS_PWA ? ['@webext-core/messaging'] : ['virtual:pwa-register/react'],
    },
    minify: isDev || isTest ? false : 'esbuild',
  },
  base: PLATFORM_IS_PWA ? '/llm-x/' : undefined,
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
  test: {
    testTimeout: 500,
    hookTimeout: 500,
    setupFiles: ['@vitest/web-worker', 'vitest-localstorage-mock', '/src/tests/setupTests.ts'],
    mockReset: true,
    environment: 'jsdom',
    globals: true,
    include: ['**/*.{test,spec}.?(c|m)[jt]s?(x)'],

    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/core/**'],
      exclude: ['node_modules', 'dist'],
      all: true,
      thresholds: {
        lines: COVERAGE_PERCENTAGE,
        functions: COVERAGE_PERCENTAGE,
        branches: COVERAGE_PERCENTAGE,
        statements: COVERAGE_PERCENTAGE,
      },
    },
  },
})
