import _ from 'lodash'
import { makeAutoObservable, observable } from 'mobx'

export type Toast = {
  id: string
  message: string
  body?: React.ReactNode
  type: 'error' | 'success' | 'info'
}

class ToastStore {
  toasts = observable.array<Toast>()

  constructor() {
    makeAutoObservable(this)
  }

  addToast = (message: string, type: Toast['type'], error?: unknown) => {
    if (this.toasts.length === 10) {
      const lastToast = _.last(this.toasts)

      _.remove(this.toasts, lastToast)
    }

    this.toasts.push({
      id: _.uniqueId('toast_'),
      message,
      type,
      body: error instanceof Error ? JSON.stringify(error.message, null, 2) : undefined,
    })
  }

  removeToast(toast: Toast) {
    _.remove(this.toasts, toast)
  }

  clearToasts() {
    this.toasts.clear()
  }
}

export const toastStore = new ToastStore()
