import localForage from 'localforage'

const imageDb = localForage.createInstance({ name: 'llm-x', storeName: 'images' })

const getCache = () => {
  return caches.open('v1')
}

export const put = async (path: string, data: string) => {
  if (__PLATFORM__ === 'chrome') {
    return imageDb.setItem(path, data)
  }

  const response = await fetch(data)

  return putResponse(path, response.clone())
}

export const putResponse = async (path: string, response: Response) => {
  const cache = await getCache()

  await cache.put(path, response)
}

export const get = async (path: string): Promise<string | undefined> => {
  console.log('getting: ', path)

  if (__PLATFORM__ === 'chrome') {
    return (await imageDb.getItem<string>(path)) || undefined
  }

  const cache = await getCache()
  const cachedResponse = await cache.match(path)

  return cachedResponse?.url
}

export const destroy = async (path: string) => {
  if (__PLATFORM__ === 'chrome') {
    return imageDb.removeItem(path)
  }

  const cache = await getCache()

  await cache.delete(path)
}

export const move = async (fromPath: string, toPath: string) => {
  const item = await get(fromPath)

  if (!item) return

  await put(toPath, item)
  await destroy(fromPath)
}
