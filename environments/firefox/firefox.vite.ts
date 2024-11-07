import { PluginOption } from 'vite'
import webExtension from 'vite-plugin-web-extension'

export const firefoxPlugins: () => PluginOption[] = () => [
  // @ts-expect-error this works just fine
  webExtension({
    manifest: './environments/firefox/firefox.manifest.json',
    browser: 'firefox',
  }),
]
