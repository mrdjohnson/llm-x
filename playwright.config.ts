import { defineConfig } from '@playwright/test'

export default defineConfig({
  use: {
    testIdAttribute: 'data-testid',
  },
})
