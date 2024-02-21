import { types, cast } from 'mobx-state-tree'
import _ from 'lodash'

const ToastModel = types.model({
  id: types.identifier,
  message: types.string,
  type: types.string,
})

const ToastStore = types
  .model({
    toasts: types.array(ToastModel),
  })
  .actions(self => ({
    addToast(message: string, type: 'error' | 'success' | 'info') {
      self.toasts.push({ id: _.uniqueId('toast_'), message, type })
    },

    removeToast(toast: { id: string }) {
      const withoutToast = _.reject(self.toasts, { id: toast.id })

      self.toasts = cast(withoutToast)
    },

    clearToasts() {
      self.toasts = cast([])
    },
  }))

export const toastStore = ToastStore.create({ toasts: [] })
