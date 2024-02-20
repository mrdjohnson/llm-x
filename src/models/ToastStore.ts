import { types, Instance, cast } from 'mobx-state-tree'
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
      const toast = ToastModel.create({ id: _.uniqueId('toast'), message, type })
      self.toasts.push(toast)

      setTimeout(() => {
        this.removeToast(toast)
      }, 3000)
    },

    removeToast(toast: IToastModel) {
      const withoutToast = _.reject(self.toasts, toast)

      self.toasts = cast(withoutToast)
    },
  }))

export const toastStore = ToastStore.create({ toasts: [] })
