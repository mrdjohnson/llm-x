import browser from 'webextension-polyfill'

import { messenger } from '~/core/crossPlatform/messenger/Messenger.platform'
import { registerPlatformBridge } from '~/core/crossPlatform/bridge/Bridge.platform'
import { getContentFromTab, getTabContent } from '~/utils/getTabContent'

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch(error => console.error(error))

registerPlatformBridge()

browser.runtime.onInstalled.addListener(() => {
  console.log('Installed!')

  chrome.tabs.create({
    url: 'https://www.imdb.com/name/nm0000226/',
  })

  chrome.sidePanel.setOptions({
    path: "index.html",
    enabled: true
  });
})

// Listen when active tab changes
chrome.tabs.onActivated.addListener(activeInfo => {
  getTabContent(activeInfo.tabId).then(tabContent => {
    messenger.sendMessage('tabChanged', tabContent)
  })
})

// Listen when the URL of the active tab updates
chrome.tabs.onUpdated.addListener((_tabId, _changeInfo, tab) => {
  messenger.sendMessage('tabChanged', getContentFromTab(tab))
})

// const getPageContent = async () => {
//   const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })

//   if (!activeTab?.id) return 'no tab id found'

//   const content = await chrome.scripting.executeScript({
//     target: { tabId: activeTab.id },
//     injectImmediately: true,
//     func: () => document.body.outerHTML,
//     // args: ['body']  // you can use this to target what element to get the html for
//   })

//   return content[0]?.result || ' no content'
// }

// messenger.onMessage('pageContent', async () => {
//   let pageContent
//   try {
//     console.log('getting page content ')
//     pageContent = await getPageContent()

//     console.log('pageContent', pageContent)
//   } catch (e: unknown) {
//     pageContent = 'error: ' + _.toString(e)
//   }

//   messenger.sendMessage('pageContent', pageContent)
// })
