import _ from 'lodash'
import { isObservable, makeObservable, observable, toJS } from 'mobx'
import { AnyZodObject } from 'zod'

export default class EntityCache<Input extends { id: string }, Output = Input> {
  map = observable.map<string, Output>()

  private transform: (input: Input) => Output
  private annotations?: object

  constructor({
    transform,
    schema,
  }: { transform?: (input: Input) => Output; schema?: AnyZodObject } = {}) {
    this.transform = transform || _.identity

    if (schema) {
      this.annotations = _.mapValues(schema.shape, () => undefined)
    }
  }

  get length() {
    return this.map.size
  }

  put = (entity: Input, checkCache: boolean = true) => {
    if (checkCache) {
      const cachedEntity = this.get(entity.id)

      if (cachedEntity) {
        const observedEntity = cachedEntity

        _.merge(observedEntity, entity)

        return observedEntity
      }
    }

    let entityObservable = entity

    if (!isObservable(entity)) {
      // a map of Record keys to null so they can be observed
      const observableFields = toJS(this.annotations)

      // keeps the real values on the object, while keeping the undefined fields
      const record = _.merge({}, observableFields, entity)

      entityObservable = makeObservable(
        record,
        _.mapValues(this.annotations, () => observable),
      )
    }

    const transformedEntity = this.transform(entityObservable)

    this.map.set(entity.id, transformedEntity)

    return transformedEntity
  }

  remove = (entityId: string) => {
    this.map.delete(entityId)
  }

  get = (entityId: string) => {
    return this.map.get(entityId)
  }

  getOrPut = (entity: Input) => {
    const cached = this.get(entity.id)

    if (cached) return cached

    return this.put(entity)
  }

  clear = () => {
    this.map.clear()
  }

  allValues = (): Output[] => {
    return Array.from(this.map.values())
  }
}
