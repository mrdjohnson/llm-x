import { PluginOption } from 'vite'
import webExtension from 'vite-plugin-web-extension'

export const chromePlugins: () => PluginOption[] = () => [
  // @ts-expect-error this works just fine
  webExtension({
    manifest: './environments/chrome/chrome.manifest.json',
    browser: 'chrome',
  }),
]
