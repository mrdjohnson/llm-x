import allThemes from 'daisyui/src/theming/themes'

export const colors = {
  error: 'oklch(51% 0.17 22.1)',
}

export const systemThemeConfig = { light: 'light', dark: 'dark' }

export const themeConfig = {
  enabledThemes: [
    'acid',
    'aqua',
    'autumn',
    'black',
    'bumblebee',
    //'business',
    'cmyk',
    'coffee',
    //'corporate',
    'cupcake',
    'cyberpunk',
    'dark',
    'dim',
    'dracula',
    //'emerald',
    //'fantasy',
    'forest',
    'garden',
    //'halloween',
    //'lemonade',
    { light: 'garden' }, // alias: light -> garden
    //{ 'Light (Original)': 'light' }, // original light theme
    'lofi',
    //'luxury',
    'night',
    'nord',
    'pastel',
    'retro',
    'sunset',
    'synthwave',
    'valentine',
    'winter',
    'wireframe',
  ],

  defaultTheme: 'dracula',

  customizations: {
    // Regex patterns for multiple themes (examples)
    // '^dark.*': { /* customizations for themes starting with 'dark' */ },
    // '.*night.*': { /* customizations for themes containing 'night' */ },
    // '(dracula|dark|night|black)': { /* customizations for dark-themed themes */ },
    // '^(light|garden|cupcake)$': { /* customizations for specific light themes */ },

    '*': {
      error: colors.error,
    },

    garden: {
      primary: 'oklch(62.45% 0.1947 3.83636)',
    },
  },
}

export const getThemeKeys = (): string[] => {
  const themes: string[] = []

  themes.push('_system')
  themeConfig.enabledThemes.forEach(theme => {
    if (typeof theme === 'string') {
      themes.push(theme)
    } else {
      themes.push(Object.keys(theme)[0]) // push alias as theme
    }
  })

  return themes
}

export const getThemeDisplayNames = (): Record<string, string> => {
  const themes: Record<string, string> = {}

  themes['_system'] = 'System Theme'
  themeConfig.enabledThemes.forEach(theme => {
    if (typeof theme === 'string') {
      themes[theme] = theme.charAt(0).toUpperCase() + theme.slice(1)
    } else {
      const [alias] = Object.keys(theme)
      themes[alias] = alias.charAt(0).toUpperCase() + alias.slice(1)
    }
  })

  return themes
}

export const resolveThemeAlias = (themeKey: string): string => {
  if (themeKey === '_system') return '_system'

  for (const theme of themeConfig.enabledThemes) {
    if (typeof theme === 'object') {
      const [alias, actualTheme] = Object.entries(theme)[0]
      if (alias === themeKey) {
        return actualTheme
      }
    }
  }

  return themeKey
}

export const getEnabledDaisyThemes = () => {
  const enabledThemes: Record<string, any> = {}

  themeConfig.enabledThemes.forEach(theme => {
    let actualThemeName: string

    if (typeof theme === 'string') {
      actualThemeName = theme
    } else {
      // It's an alias object, get the actual theme name
      const [alias, actualTheme] = Object.entries(theme)[0]

      // Skip _system theme as it's not a real DaisyUI theme
      if (alias === '_system') return

      actualThemeName = actualTheme as string
    }

    if ((allThemes as any)[actualThemeName]) {
      let themeCustomizations = { ...(allThemes as any)[actualThemeName] }

      // Apply customizations in order of specificity (least to most specific)
      Object.entries(themeConfig.customizations).forEach(([pattern, customization]) => {
        if (pattern === '*') {
          // Global wildcard - applies to all themes
          themeCustomizations = { ...themeCustomizations, ...customization }
        } else if (pattern === actualThemeName) {
          // Exact theme name match - most specific, applied last
          themeCustomizations = { ...themeCustomizations, ...customization }
        } else {
          // Try regex pattern matching
          try {
            const regex = new RegExp(pattern)
            if (regex.test(actualThemeName)) {
              themeCustomizations = { ...themeCustomizations, ...customization }
            }
          } catch (e) {
            // Invalid regex pattern, skip silently
            console.warn(`Invalid regex pattern in theme customizations: ${pattern}`)
          }
        }
      })

      enabledThemes[actualThemeName] = themeCustomizations
    }
  })

  return enabledThemes
}
