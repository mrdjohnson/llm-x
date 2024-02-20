import { observer } from 'mobx-react-lite'

import { toastStore } from '../models/ToastStore'

const ToastCenter = observer(() => {
  return (
    <div className="toast toast-center z-30">
      {toastStore.toasts.map(toast => {
        return (
          <div
            className={`alert alert-${toast.type} text-xl font-bold rounded-md relative px-4 max-w-10/12`}
          >
            <span>{toast.message}</span>

            <div
              className="absolute top-1 right-1 opacity-50 btn btn-xs"
              onClick={() => toastStore.removeToast(toast)}
            >
              x
            </div>
          </div>
        )
      })}
    </div>
  )
})

export default ToastCenter
