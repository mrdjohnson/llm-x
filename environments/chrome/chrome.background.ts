import { messenger } from '~/core/messenger/Messenger.platform'

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch(error => console.error(error))

import browser from 'webextension-polyfill'
import _ from 'lodash'

browser.runtime.onInstalled.addListener(() => {
  console.log('Installed!')
})

function notifyTabChange(tab: chrome.tabs.Tab) {
  if (tab.active && tab.url && tab.title) {
    console.log('Active tab URL:', tab.url)

    messenger.sendMessage('tabChanged', { url: tab.url, title: tab.title })
  }
}

// Listen when active tab changes
chrome.tabs.onActivated.addListener(activeInfo => {
  chrome.tabs.get(activeInfo.tabId, tab => {
    if (chrome.runtime.lastError || !tab) return // avoid errors when tab is closed

    notifyTabChange(tab)
  })
})

// Listen when the URL of the active tab updates
chrome.tabs.onUpdated.addListener((_tabId, _changeInfo, tab) => {
  notifyTabChange(tab)
})

const getPageContent = async () => {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })

  if (!activeTab?.id) return 'no tab id found'

  const content = await chrome.scripting.executeScript({
    target: { tabId: activeTab.id },
    injectImmediately: true,
    func: () => document.body.outerHTML,
    // args: ['body']  // you can use this to target what element to get the html for
  })

  return content[0]?.result || ' no content'
}


messenger.onMessage('pageContent', async () => {
  let pageContent
  try {
    console.log('getting page content ')
    pageContent = await getPageContent()

    console.log('pageContent', pageContent)
  } catch (e: unknown) {
    pageContent = 'error: ' + _.toString(e)
  }

  messenger.sendMessage('pageContent', pageContent)
})
