import { notifications } from '@mantine/notifications'

export type Toast = {
  id: string
  message: string
  body?: React.ReactNode
  type: 'error' | 'success' | 'info'
}

class ToastStore {
  colorByType = {
    error: 'red',
    success: 'green',
    info: 'blue',
  }

  addToast = (title: string, type: Toast['type'], error?: unknown) => {
    notifications.show({
      title,
      message: error instanceof Error ? JSON.stringify(error.message, null, 2) : undefined,
      color: this.colorByType[type],
    })
  }
}

export const toastStore = new ToastStore()
