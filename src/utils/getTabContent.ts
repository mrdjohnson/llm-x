export const getContentFromTab = (tab: chrome.tabs.Tab) => {
  if (tab.active && tab.url && tab.title) {
    console.log('Active tab URL:', tab.url)

    return { url: tab.url, title: tab.title }
  }
}

export const getTabContent = async (activeTabId?: number) => {
  if (!activeTabId) {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })

    return getContentFromTab(activeTab)
  }

  let tabContent: { url: string; title: string } | undefined

  chrome.tabs.get(activeTabId, tab => {
    if (chrome.runtime.lastError || !tab) return // avoid errors when tab is closed

    tabContent = getContentFromTab(tab)
  })

  return tabContent
}
