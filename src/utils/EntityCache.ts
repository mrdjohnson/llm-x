import _ from 'lodash'
import { isObservable, makeAutoObservable, observable } from 'mobx'

export default class EntityCache<Input extends { id: string }, Output = Input> {
  map = observable.map<string, Output>()

  private transform: (input: Input) => Output

  constructor(transform?: (input: Input) => Output) {
    this.transform = transform || _.identity
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

    const entityObservable = isObservable(entity) ? entity : makeAutoObservable(entity)

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
