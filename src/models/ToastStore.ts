import { types, cast, Instance, detach } from 'mobx-state-tree'
import _ from 'lodash'

const ToastModel = types.model({
  id: types.identifier,
  message: types.string,
  type: types.string,
})

export interface IToastModel extends Instance<typeof ToastModel> {}

const ToastStore = types
  .model({
    toasts: types.array(ToastModel),
  })
  .actions(self => ({
    addToast(message: string, type: 'error' | 'success' | 'info') {
      let toasts: IToastModel[] = self.toasts

      if (toasts.length === 10) {
        // remove last toast
        toasts = _.drop(toasts)
      }

      self.toasts = cast([...toasts, { id: _.uniqueId('toast_'), message: message, type }])
    },

    removeToast(toast: { id: string }) {
      detach(toast)

      _.remove(self.toasts, toast)
    },

    clearToasts() {
      self.toasts = cast([])
    },
  }))

export const toastStore = ToastStore.create({ toasts: [] })
