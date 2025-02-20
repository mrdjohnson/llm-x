import { beforeEach, afterEach, beforeAll, afterAll } from 'vitest'
import localforage from 'localforage'

import '@testing-library/jest-dom'

import { server } from '~/tests/msw'
import { settingTable } from '~/core/setting/SettingTable'
import { DATABASE_TABLES } from '~/core/db'

beforeAll(() => {
  server.listen({
    onUnhandledRequest(request) {
      console.log('Unhandled %s %s', request.method, request.url)
    },
  })
})

beforeEach(async () => {
  // delete all data
  await localforage.dropInstance({ name: 'llm-x' })

  //   clear the cache on each table
  DATABASE_TABLES.forEach(table => table.cache.clear())

  // make sure the system setting exists
  await settingTable.create({}, 'setting')
})

afterEach(async () => {
  server.resetHandlers()
})

afterAll(() => server.close())
