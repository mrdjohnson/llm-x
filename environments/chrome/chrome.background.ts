chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch(error => console.error(error))

import browser from 'webextension-polyfill'

browser.runtime.onInstalled.addListener(() => {
  console.log('Installed!')
})
