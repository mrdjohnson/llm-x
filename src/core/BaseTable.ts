import _ from 'lodash'
import localForage from 'localforage'
import { createId } from '@paralleldrive/cuid2'
import { AnyZodObject, ZodType, ZodTypeDef } from 'zod'

import EntityCache from '~/utils/EntityCache'

export abstract class BaseTable<
  Schema extends ZodType<Output, ZodTypeDef, Input>,
  Output extends { id: string } = Schema['_output'],
  Input = Schema['_input'],
> {
  abstract schema: Schema
  CURRENT_DB_DATE = 'Oct 28 2024'

  localStorageLocation?: string = undefined

  primaryKey: string = 'id'

  database: typeof localForage

  cache: EntityCache<Output>

  // if this table import/export is handled by another table (ie Chats and Messages)
  hasParentExportTable: boolean = false

  constructor() {
    this.database = localForage.createInstance({ name: 'llm-x', storeName: this.getTableName() })
    console.log('created table for %s', this.getTableName())

    this.cache = new EntityCache<Output>({ schema: this.getModel() })
  }

  abstract getModel(): AnyZodObject
  abstract getTableName(): string

  findCachedById(id?: string) {
    if (!id) return undefined

    return this.cache.get(id)
  }

  length() {
    return this.database.length()
  }

  parse = (params: Omit<Input, 'id'>) => {
    const result = this.schema.safeParse({ ...params, id: createId() })

    // todo maybe put in error table?
    if (result.error) {
      console.error(result.error)
      throw result.error
    }

    return result.data
  }

  async create(params: Omit<Input, 'id'>, idOverride?: string) {
    const entity = this.parse(params)

    if (idOverride) {
      entity.id = idOverride
    }

    return this.put(entity)
  }

  async all({ cache } = { cache: true }) {
    const allValues: Output[] = []

    await this.iterate((value: Output) => {
      allValues.push(value)

      if (cache) {
        this.cache.put(this.schema.parse(value), false)
      }
    })

    return _.compact(allValues)
  }

  async iterate(callBack: (value: Output) => void) {
    await this.database.iterate(callBack)
  }

  async findById(id?: string) {
    if (!id) return undefined

    const cached = this.findCachedById(id)

    if (cached) return cached

    const entity = await this.database.getItem<Output>(id)

    if (!entity) return undefined

    return this.cache.put(this.schema.parse(entity), false)
  }

  async findByIds(ids: string[]): Promise<Output[]> {
    const items: Array<Output | undefined> = []

    for (const id of ids) {
      const item = await this.findById(id)

      items.push(item)
    }

    return _.compact(items)
  }

  async put(entity: Output, { skipCache = false }: { skipCache?: boolean } = {}) {
    // console.log('data: ', entity, this.getModel().safeParse(entity).data)
    await this.database.setItem(entity.id, this.getModel().safeParse(entity).data)

    if (skipCache) {
      return entity
    }

    return this.cache.put(entity)
  }

  async destroy(entity: Output) {
    return this.destroyById(entity.id)
  }

  private async destroyById(id: string) {
    this.cache.remove(id)

    return this.database.removeItem(id)
  }

  async destroyMany(ids: string[]) {
    for (const id of ids) {
      try {
        this.destroyById(id)
      } catch (e) {
        console.error(e)
      }
    }
  }

  async bulkInsert(entities?: Array<Output>, { skipCache = false }: { skipCache?: boolean } = {}) {
    if (!entities) return

    for (const entity of entities) {
      try {
        await this.put(entity, { skipCache })
      } catch (e) {
        console.error(e)
      }
    }
  }

  async duplicate(entity: Output) {
    return this.put({ ...entity, id: createId() })
  }

  async clearCacheAndPreload() {
    this.cache.clear()
  }

  async migrateFromLegacyStorage(): Promise<Output[] | undefined> {
    if (this.localStorageLocation) {
      const legacyDataString = localStorage.getItem(this.localStorageLocation)

      if (legacyDataString) {
        return this.importFromLegacy(JSON.parse(legacyDataString))
      }
    }

    return undefined
  }

  async migrate(_lastUpgradeTimestamp?: number) {
    if (!_.isNumber(_lastUpgradeTimestamp)) {
      await this.migrateFromLegacyStorage()
    }
  }

  async importFromLegacy(_data: unknown): Promise<Output[] | undefined> {
    return undefined
  }

  async import(data: unknown) {
    if (!_.isObject(data)) return

    const { data: model } = this.schema.safeParse({ ...data, id: createId() })

    if (model) {
      await this.put(model)
    }
  }

  async importAll(datums: unknown) {
    if (_.isArray(datums)) {
      for (const data of datums) {
        await this.import(data)
      }
    }
  }

  async export(model: Output, _options: Record<string, unknown> = {}): Promise<unknown> {
    return model
  }

  async exportAll(options: Record<string, unknown> = {}) {
    const allValues: unknown[] = []

    const allModels = await this.all({ cache: false })

    for (const model of allModels) {
      const output = await this.export(model, options)

      if (output) {
        allValues.push(output)
      }
    }

    return allValues
  }
}
