// learned from page-assist and ollama-ui

export const rewriteChromeUrl = async (host?: string) => {
  if (__PLATFORM__ !== 'chrome' || !host) return

  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
    const url = new URL(host)

    const domains = [url.hostname]
    const nextOrigin = `${url.protocol}//${url.hostname}`

    const rules = [
      {
        id: 1,
        condition: {
          requestDomains: domains,
        },
        action: {
          type: 'modifyHeaders',
          requestHeaders: [
            {
              header: 'origin',
              operation: 'set',
              value: nextOrigin,
            },
          ],
        },
      },
    ]

    console.log('rewriteChromeUrl', url)

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: rules.map(r => r.id),
      // @ts-expect-error this works properly
      addRules: rules,
    })

    if (url.hostname === 'localhost') {
      await rewriteChromeUrl(`${url.protocol}//127.0.0.1`)
    }
  }
}
