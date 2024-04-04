class CachedStorage {
  private static getCache() {
    return caches.open('v1')
  }

  // TODO: do something with this.
  // navigator.storage.estimate().then(function (estimate) {
  //   console.log(`Using ${estimate.usage! / 1e6} out of ${estimate.quota! / 1e6} mb.`)
  // })

  static async put(path: string, data: string) {
    const response = await fetch(data)

    return CachedStorage.putResponse(path, response.clone())
  }

  static async putResponse(path: string, response: Response) {
    const cache = await CachedStorage.getCache()

    await cache.put(path, response)
  }

  static async get(path: string) {
    const cache = await CachedStorage.getCache()
    const cachedResponse = await cache.match(path)

    return cachedResponse?.url
  }

  static async delete(path: string) {
    const cache = await CachedStorage.getCache()

    await cache.delete(path)
  }
}

export default CachedStorage
