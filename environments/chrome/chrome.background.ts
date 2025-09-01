import { messenger } from '~/core/messenger/Messenger.platform'

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch(error => console.error(error))

import browser from 'webextension-polyfill'
import _ from 'lodash'

browser.runtime.onInstalled.addListener(() => {
  console.log('Installed!')
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
