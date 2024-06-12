/** @type {import('tailwindcss').Config} */

import { nextui } from '@nextui-org/react'
import themes from 'daisyui/src/theming/themes'

module.exports = {
  content: [
    'src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  darkMode: 'class',
  plugins: [require('@tailwindcss/typography'), require('daisyui'), nextui()],
  daisyui: {
    themes: [
      {
        garden: {
          ...themes['garden'],
          primary: 'oklch(62.45% 0.1947 3.83636)',
        },
      },
      'dark',
      'dracula',
    ],
  },
}
