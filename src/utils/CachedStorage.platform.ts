const cachedImageWorker = new ComlinkWorker<
  typeof import('./cachedStorage/CachedStorage.worker.ts')
>(new URL('./cachedStorage/CachedStorage.worker.ts', import.meta.url), {})
class CachedStorage {
  static async put(path: string, data: string) {
    return cachedImageWorker.put(path, data)
  }

  static async putResponse(path: string, response: Response) {
    return cachedImageWorker.putResponse(path, response)
  }

  static async get(path: string) {
    return cachedImageWorker.get(path)
  }

  static async delete(path: string) {
    return cachedImageWorker.destroy(path)
  }

  static async move(fromPath: string, toPath: string) {
    return cachedImageWorker.move(fromPath, toPath)
  }
}

export default CachedStorage
