import _ from 'lodash'
import { makeAutoObservable, observable } from 'mobx'

type Toast = {
  id: string
  message: string
  type: 'error' | 'success' | 'info'
}

class ToastStore {
  toasts = observable.array<Toast>()

  constructor() {
    makeAutoObservable(this)
  }

  addToast = (message: string, type: Toast['type']) => {
    if (this.toasts.length === 10) {
      const lastToast = _.last(this.toasts)

      _.remove(this.toasts, lastToast)
    }

    this.toasts.push({ id: _.uniqueId('toast_'), message: message, type })
  }

  removeToast(toast: Toast) {
    _.remove(this.toasts, toast)
  }

  clearToasts() {
    this.toasts.clear()
  }
}

export const toastStore = new ToastStore()
