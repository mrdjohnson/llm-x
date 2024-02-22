import { useEffect, useState } from 'react'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'

import { toastStore } from '../models/ToastStore'

const ToastCenter = observer(() => {
  const [hovering, setHovering] = useState(false)

  const { toasts } = toastStore

  useEffect(() => {
    if (_.isEmpty(toasts) || hovering) return

    const timeout = setTimeout(() => {
      toastStore.clearToasts()
    }, 3000)

    return () => clearTimeout(timeout)
  }, [toastStore.toasts, hovering])

  return (
    <dialog
      className="toast toast-center z-30 bg-transparent"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {toasts.map(toast => (
        <div
          className={`alert alert-${toast.type} max-w-10/12 relative rounded-md border border-base-content/30 px-4 text-xl font-bold`}
        >
          <span className="cursor-default">{toast.message}</span>

          <div
            className="btn btn-xs absolute right-1 top-1 text-sm font-bold opacity-50"
            onClick={() => toastStore.removeToast(toast)}
          >
            x
          </div>
        </div>
      ))}
    </dialog>
  )
})

export default ToastCenter
