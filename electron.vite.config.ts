import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'

import config from './vite.config'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@root': resolve(__dirname),
      },
    },
    build: {
      outDir: `./environments/electron/dist/main`,
      lib: {
        entry: resolve(__dirname, 'environments/electron/main/index.ts'),
        formats: ['cjs'],
        name: 'llmx', // This is required for UMD/IIFE builds
      },
      rollupOptions: config.build?.rollupOptions,
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: `./environments/electron/dist/preload`,
      lib: {
        entry: resolve(__dirname, 'environments/electron/preload/index.ts'),
        formats: ['cjs'],
        name: 'llmx', // This is required for UMD/IIFE builds
      },
      rollupOptions: {
        output: {
          entryFileNames: 'index.js',
        },
        ...config.build?.rollupOptions,
      },
    },
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src'),
      },
    },
    root: resolve(__dirname),
    ...config,
    build: {
      outDir: `./environments/electron/dist/renderer`,
      lib: {
        entry: resolve(__dirname, 'index.html'),
        formats: ['cjs'],
        name: 'llmx', // This is required for UMD/IIFE builds
      },
      rollupOptions: {
        input: resolve(__dirname, 'index.html'),
        ...config.build?.rollupOptions,
      },
    },
  },
})
