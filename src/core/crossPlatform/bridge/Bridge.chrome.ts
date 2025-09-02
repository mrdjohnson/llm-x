import { defineProxyService } from '@webext-core/proxy-service'

import { IBridge } from '~/core/crossPlatform/bridge/IBridge'
import { getTabContent } from '~/utils/getTabContent'

const handlePageContent = async () => {
  const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })

  if (!activeTab) {
    console.log('no tab found')
    const tabs = await chrome.tabs.query({})
    console.log('found %d tabs: ', tabs.length)
    return
  }

  if (activeTab.id === undefined) {
    console.log('no tab id found')
    return
  }

  const content = await chrome.scripting.executeScript({
    target: { tabId: activeTab.id },
    injectImmediately: true,
    func: () => document.body.outerHTML,
    // args: ['body']  // you can use this to target what element to get the html for
  })

  const result = content[0]?.result

  if (!result) console.log(' no content')

  return result
}

class PlatformBridge implements IBridge {
  async getPageContent(): Promise<string | undefined> {
    return await handlePageContent()
  }

  async getTabContent(): Promise<{ url: string; title: string } | undefined> {
    return getTabContent()
  }
}

export const [registerPlatformBridge, getPlatformBridge] = defineProxyService(
  'PlatformBridge',
  () => new PlatformBridge(),
)
