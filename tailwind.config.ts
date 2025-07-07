/** @type {import('tailwindcss').Config} */

import { heroui } from '@heroui/react'
import themes from 'daisyui/src/theming/themes'

const errorColor = 'oklch(51% 0.17 22.1)'

const allThemes = Object.entries(themes).map(([name, theme]) => {
  if (name === 'garden') {
    return {
      [name]: {
        ...theme,
        primary: 'oklch(62.45% 0.1947 3.83636)',
        error: errorColor,
      },
    }
  }

  return {
    [name]: {
      ...theme,
      error: errorColor,
    },
  }
})

module.exports = {
  content: ['src/**/*.{js,ts,jsx,tsx}', './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  darkMode: 'class',
  plugins: [
    require('@tailwindcss/typography'),
    require('daisyui'),
    heroui({
      themes: {
        light: {
          colors: {
            danger: errorColor,
          },
        },
        dark: {
          colors: {
            danger: errorColor,
          },
        },
      },
    }),
  ],
  daisyui: {
    themes: allThemes,
  },
}
