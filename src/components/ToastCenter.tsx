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
          className={`alert alert-${toast.type} text-xl font-bold rounded-md relative px-4 max-w-10/12 border border-base-content/30`}
        >
          <span className="cursor-default">{toast.message}</span>

          <div
            className="absolute top-1 right-1 opacity-50 btn btn-xs font-bold text-sm"
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
