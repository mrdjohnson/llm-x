/** @type {import('tailwindcss').Config} */

import { nextui } from '@nextui-org/react'
import themes from 'daisyui/src/theming/themes'

const errorColor = 'oklch(51% 0.17 22.1)'

module.exports = {
  content: [
    'src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  darkMode: 'class',
  plugins: [require('@tailwindcss/typography'), require('daisyui'), nextui({
    themes: {
      light: {
        colors: {
          danger: errorColor
        }
      },
      dark: {
        colors: {
          danger: errorColor
        }
      }
    }
  })],
  daisyui: {
    themes: [
      {
        garden: {
          ...themes['garden'],
          primary: 'oklch(62.45% 0.1947 3.83636)',
          error: errorColor
        },
      },
      {
        dark: {
          ...themes['dark'],
          error: errorColor
        },
      },
      {
        dracula: {
          ...themes['dracula'],
          error: errorColor
        },
      },
    ],
  },
}
