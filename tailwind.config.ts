/** @type {import('tailwindcss').Config} */

import { heroui } from '@heroui/react'
import { getEnabledDaisyThemes, colors } from './src/utils/themeConfig'

const allThemes = Object.entries(getEnabledDaisyThemes()).map(([name, theme]) => ({
  [name]: theme,
}))

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
            danger: colors.error,
          },
        },
        dark: {
          colors: {
            danger: colors.error,
          },
        },
      },
    }),
  ],
  daisyui: {
    themes: allThemes,
  },
}
