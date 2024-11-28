import { ModelDetails, Ollama, ShowResponse } from 'ollama/browser'
import { makeAutoObservable } from 'mobx'

import { toastStore } from '~/core/ToastStore'
import { progressStore } from '~/core/ProgressStore'
import OllamaConnectionViewModel from '~/core/connection/viewModels/OllamaConnectionViewModel'

export type CorrectShowResponse = Pick<ShowResponse, 'license' | 'modelfile' | 'template'> & {
  details: ModelDetails
}

class OllamaStore {
  constructor(private connection: OllamaConnectionViewModel) {
    makeAutoObservable(this)
  }

  get ollama() {
    return new Ollama({ host: this.connection.formattedHost })
  }

  show(modelName: string) {
    // @ts-expect-error library is typed incorrectly; https://github.com/ollama/ollama-js/issues/74
    return this.ollama.show({ model: modelName }) as Promise<CorrectShowResponse>
  }

  delete(modelName: string) {
    return this.ollama.delete({ model: modelName }).then(() => {
      return this.connection.fetchLmModels()
    })
  }

  async updateAll() {
    const models = (await this.ollama.list()).models

    let failedTotal = 0

    const totalProgress = progressStore.create({
      label: `0% (0/${models.length})`,
      subLabel: 'Updating all models',
    })

    for (let index = 1; index <= models.length; index++) {
      const { name } = models[index - 1]

      const progress = await this.pull(name, { isUpdate: true })

      const totalPercent = Math.round((index / models.length) * 100)

      totalProgress.update({ label: `${totalPercent}% (${index}/${models.length})` })

      if (progress.status === 'error') {
        failedTotal += 1

        totalProgress.update({ extra: `${failedTotal} failed to update` })
      }

      progressStore.delete(progress)
    }

    progressStore.delete(totalProgress)

    let finishedMessage = `Updated ${models.length - failedTotal}/${models.length} models.`
    if (failedTotal > 0) {
      finishedMessage += ' See more info in the console logs.'
    }

    this.connection.fetchLmModels().then(() => {
      toastStore.addToast(finishedMessage, 'info')
    })
  }

  async pull(model: string, { isUpdate }: { isUpdate?: boolean } = {}) {
    const progress = progressStore.create({
      label: '0%',
      subLabel: model,
    })

    try {
      const stream = await this.ollama.pull({ model, stream: true })

      let percent = 0

      for await (const part of stream) {
        if (part.completed && part.total) {
          percent = Math.round((part.completed / part.total) * 100)

          progress.update({ label: percent + '%' })
        }

        if (percent === 100) {
          progress.update({ status: 'complete' })
        }

        progress.update({ extra: part.status || '' })
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
        progress.update({ label: 'Unable to complete pull.' })
      } else if (progress.status === 'complete') {
        if (!isUpdate) {
          toastStore.addToast(`Completed download of ${model}`, 'success')
        }

        progress.update({ label: '', extra: 'Finished' })
      }

      if (!isUpdate) {
        progressStore.delete(progress, { shouldDelay: true })

        this.connection.fetchLmModels()
      }
    }

    return progress
  }
}

export default OllamaStore
