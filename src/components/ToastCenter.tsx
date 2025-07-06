import { useEffect, useState } from 'react'
import _ from 'lodash'
import { twMerge } from 'tailwind-merge'
import useMedia from 'use-media'

import { toastStore } from '~/core/ToastStore'
import { settingStore } from '~/core/setting/SettingStore'

const ToastCenter = () => {
  const [hovering, setHovering] = useState(false)
  const isMobile = useMedia('(max-width: 768px)')

  const { toasts } = toastStore

  // this effect will run every render, yes
  // but it will also auto update whenever there is a change to toasts
  useEffect(() => {
    if (hovering || _.isEmpty(toasts)) return

    const timeout = setTimeout(() => {
      toastStore.clearToasts()
    }, 3000)

    return () => clearTimeout(timeout)
  })

  return (
    <div
      className={twMerge(
        'toast z-30 mb-24 w-full gap-3 bg-transparent',
        _.isEmpty(toasts) && 'hidden',
        settingStore.setting.isSidebarOpen && !isMobile && 'pl-[270px]',
      )}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {toasts.map(toast => (
        <div
          className={`alert alert-${toast.type} relative mx-auto flex max-w-4xl flex-col rounded-md border border-base-content/30 px-4`}
          key={toast.id}
        >
          <span className="w-full cursor-default whitespace-pre-wrap break-words text-xl font-bold">
            {toast.message}
          </span>

          {toast.body && (
            <span className="text-md! w-full cursor-default justify-self-end whitespace-pre-wrap break-words text-base-content/60">
              {toast.body}
            </span>
          )}

          <div
            className="btn btn-xs absolute right-1 top-1 text-sm font-bold opacity-50"
            onClick={() => toastStore.removeToast(toast)}
          >
            x
          </div>
        </div>
      ))}
    </div>
  )
}

export default ToastCenter
