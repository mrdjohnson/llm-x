import { ModelDetails, Ollama, ShowResponse } from 'ollama/browser'
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

export type CorrectShowResponse = Pick<ShowResponse, 'license' | 'modelfile' | 'template'> & {
  details: ModelDetails
}

class OllamaStore {
  pullProgresses: PullProgress[] = []

  constructor() {
    makeAutoObservable(this)
  }

  get ollama() {
    return new Ollama({ host: settingStore.ollamaHost })
  }

  show(modelName: string) {
    // @ts-expect-error library is typed incorrectly; https://github.com/ollama/ollama-js/issues/74
    return this.ollama.show({ model: modelName }) as Promise<CorrectShowResponse>
  }

  delete(modelName: string) {
    return this.ollama.delete({ model: modelName }).then(() => {
      return settingStore.fetchOllamaModels()
    })
  }

  async updateAll() {
    const models = (await this.ollama.list()).models

    let failedTotal = 0

    const totalProgress: PullProgress = makeAutoObservable({
      label: `0% (0/${models.length})`,
      id: _.uniqueId('ollama-pull-progress-'),
      model: 'Updating all models',
      status: 'incomplete',
    })

    this.pullProgresses.push(totalProgress)

    for (let index = 1; index <= models.length; index++) {
      const { name } = models[index - 1]

      const progress = await this.pull(name, { isUpdate: true })

      const totalPercent = Math.round((index / models.length) * 100)

      totalProgress.label = `${totalPercent}% (${index}/${models.length})`

      if (progress.status === 'error') {
        failedTotal += 1

        totalProgress.extra = `${failedTotal} failed to update`
      }

      this.pullProgresses = _.without(this.pullProgresses, progress)
    }

    this.pullProgresses = _.without(this.pullProgresses, totalProgress)

    let finishedMessage = `Updated ${models.length - failedTotal}/${models.length} models.`
    if (failedTotal > 0) {
      finishedMessage += ' See more info in the console logs.'
    }

    settingStore.fetchOllamaModels().then(() => {
      toastStore.addToast(finishedMessage, 'info')
    })
  }

  async pull(model: string, { isUpdate }: { isUpdate?: boolean } = {}) {
    const progress: PullProgress = makeAutoObservable({
      label: '0%',
      id: _.uniqueId('ollama-pull-progress-'),
      model,
      status: 'incomplete',
    })

    this.pullProgresses.push(progress)

    try {
      const stream = await this.ollama.pull({ model, stream: true })

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

      if (!isUpdate) {
        toastStore.addToast(
          `Something went wrong with pulling ${model} check the logs for more details`,
          'error',
        )
      }

      // todo, these will never show on production
      console.error(`Something went wrong with pulling ${model}`, e)
    } finally {
      if (progress.status == 'incomplete') {
        progress.label = 'Unable to complete pull.'
      } else if (progress.status === 'complete') {
        if (!isUpdate) {
          toastStore.addToast(`Completed download of ${model}`, 'success')
        }

        progress.extra = 'Finished'
        progress.label = ''
      }

      if (!isUpdate) {
        // remove the progess after 5 seconds
        setTimeout(() => {
          this.pullProgresses = _.without(this.pullProgresses, progress)
        }, 5_000)

        settingStore.fetchOllamaModels()
      }
    }

    return progress
  }
}

export const ollamaStore = new OllamaStore()
