import { makeAutoObservable } from 'mobx'
import _ from 'lodash'

type ProgressType = {
  label: string
  id: string
  subLabel: string
  extra?: string
  status: 'incomplete' | 'complete' | 'error'
  update: (params: Partial<ProgressType>) => void
}

class ProgressStore {
  progresses: ProgressType[] = []

  constructor() {
    makeAutoObservable(this)
  }

  create({ label, subLabel }: { label: string; subLabel: string }): ProgressType {
    const progress: ProgressType = makeAutoObservable({
      id: _.uniqueId('ollama-pull-progress-'),
      label,
      subLabel,
      status: 'incomplete',

      update(params: Partial<ProgressType>) {
        _.merge(this, params)
      },
    })

    this.progresses.push(progress)

    return progress
  }

  private _delete(progress: ProgressType) {
    this.progresses = _.without(this.progresses, progress)
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
