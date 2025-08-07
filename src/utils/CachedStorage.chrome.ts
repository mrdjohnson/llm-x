import localForage from 'localforage'
import type CachedStorage from '~/utils/CachedStorage.platform'

const imageDb = localForage.createInstance({ name: 'llm-x', storeName: 'images' })

class ChromeCachedStorage implements CachedStorage {
  static async put(path: string, data: string) {
    console.log('putting in chrome: ', path)
    return imageDb.setItem(path, data)
  }

  static async get(path: string) {
    console.log('getting from chrome: ', path)
    return (await imageDb.getItem<string>(path)) || undefined
  }

  static async delete(path: string) {
    return imageDb.removeItem(path)
  }

  static async move(fromPath: string, toPath: string) {
    const item = await ChromeCachedStorage.get(fromPath)

    if (!item) return

    await ChromeCachedStorage.put(toPath, item)
    await ChromeCachedStorage.delete(fromPath)
  }
}

export default ChromeCachedStorage
