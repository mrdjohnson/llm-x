/** @type {import('tailwindcss').Config} */

import { nextui } from '@nextui-org/react'

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
    themes: ['garden', 'dark', 'dracula'],
  },
}
