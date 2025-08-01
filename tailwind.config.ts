/** @type {import('tailwindcss').Config} */

import { heroui } from '@heroui/react'
import themes, { synthwave } from 'daisyui/src/theming/themes'

const errorColor = 'oklch(51% 0.17 22.1)'

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
    themes: [
      {
        garden: {
          ...themes['garden'],
          primary: 'oklch(62.45% 0.1947 3.83636)',
          error: errorColor,
        },
      },
      {
        dark: {
          ...themes['dark'],
          error: errorColor,
        },
      },
      {
        dracula: {
          ...themes['dracula'],
          error: errorColor,
        },
      },
      {
        synthwave: {
          ...themes['synthwave'],
          error: errorColor,
        },
      },
      {
        nord: {
          ...themes['nord'],
          error: errorColor,
        },
      },
    ],
  },
}
