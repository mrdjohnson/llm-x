import { Ollama } from 'ollama/browser'
import { makeAutoObservable } from 'mobx'
import _ from 'lodash'

import { toastStore } from '~/models/ToastStore'
import { settingStore } from '~/models/SettingStore'

type PullProgress = {
  label: string
  id: string
  model: string
  extra?: string
  status: 'incomplete' | 'complete' | 'error'
}

class OllamaStore {
  pullProgresses: PullProgress[] = []

  constructor() {
    makeAutoObservable(this)
  }

  async pull(model: string) {
    const progress: PullProgress = makeAutoObservable({
      label: '0%',
      id: _.uniqueId('ollama-pull-progress-'),
      model,
      status: 'incomplete',
    })

    this.pullProgresses.push(progress)

    const ollama = new Ollama({ host: settingStore.host })

    try {
      const stream = await ollama.pull({ model, stream: true })

      let percent = 0

      for await (const part of stream) {
        if (part.completed && part.total) {
          percent = Math.round((part.completed / part.total) * 100)

          progress.label = percent + '%'
        }

        if (percent === 100) {
          progress.status = 'complete'
        }

        progress.extra = part.status
      }
    } catch (e) {
      progress.status = 'error'

      toastStore.addToast(
        `Something went wrong with pulling ${model} check the logs for more details`,
        'error',
      )

      console.error(e)
    } finally {
      if (progress.status == 'incomplete') {
        progress.label = 'Unable to complete pull.'
      } else if (progress.status === 'complete') {
        toastStore.addToast(`Completed download of ${model}`, 'success')
      }

      // remove the progess after 5 seconds
      setTimeout(() => {
        this.pullProgresses = _.without(this.pullProgresses, progress)
      }, 5_000)
    }
  }
}

export const ollamaStore = new OllamaStore()
