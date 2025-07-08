export const humanizeShortcut = (shortcut: string): string => {
  // Detect mac platform
  const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.userAgent)

  // Replace $mod with the symbol
  let result = shortcut.replace(/\$mod/gi, isMac ? '⌘' : 'Ctrl')

  // Prettify other keys
  result = result.replace(/Shift/gi, '⇧')
  result = result.replace(/Alt/gi, isMac ? '⌥' : 'Alt')
  result = result.replace(/Enter/gi, '⏎')
  result = result.replace(/\+/g, ' ')

  return result.toUpperCase()
}
