import { makeAutoObservable, observable } from 'mobx'
import _ from 'lodash'

export type ProgressInputType = {
  value: number // 0-100
  label?: string
  subLabel?: string
}

export type ProgressType = ProgressInputType & {
  id: string
  status: 'incomplete' | 'complete' | 'error'
  update: (params: Partial<ProgressType>) => void
}

class ProgressStore {
  progresses = observable.array<ProgressType>()

  constructor() {
    makeAutoObservable(this)
  }

  create(progressInput: ProgressInputType): ProgressType {
    const progress: ProgressType = makeAutoObservable({
      id: _.uniqueId('progress-'),
      ...progressInput,
      status: 'incomplete',

      update(params: Partial<ProgressType>) {
        _.merge(this, params)
      },
    })

    this.progresses.push(progress)

    return progress
  }

  private _delete(progress: ProgressType) {
    this.progresses.remove(progress)
  }

  // shouldDelay: should wait 5 seconds
  delete(progress: ProgressType, { shouldDelay = false } = {}) {
    const delay = shouldDelay ? 5_000 : 0

    setTimeout(() => {
      this._delete(progress)
    }, delay)
  }
}

export const progressStore = new ProgressStore()
