import { Ollama } from 'ollama/browser'
import { makeAutoObservable } from 'mobx'

import { toastStore } from '~/core/ToastStore'
import { progressStore } from '~/core/ProgressStore'
import OllamaConnectionViewModel from '~/core/connection/viewModels/OllamaConnectionViewModel'

class OllamaStore {
  constructor(private connection: OllamaConnectionViewModel) {
    makeAutoObservable(this)
  }

  get ollama() {
    return new Ollama({ host: this.connection.formattedHost })
  }

  show(modelName: string) {
    return this.ollama.show({ model: modelName })
  }

  delete(modelName: string) {
    return this.ollama.delete({ model: modelName }).then(() => {
      return this.connection.fetchLmModels()
    })
  }

  getCapabilities(connectionId: string): Record<string, string[]> {
    try {
      const cached = localStorage.getItem(`ollama_model_capabilities_${connectionId}`)
      return cached ? JSON.parse(cached) : {}
    } catch {
      return {}
    }
  }

  private setCapabilities(connectionId: string, capabilities: Record<string, string[]>) {
    try {
      localStorage.setItem(
        `ollama_model_capabilities_${connectionId}`,
        JSON.stringify(capabilities),
      )
    } catch (e) {
      console.error('Failed to save model capabilities to localStorage', e)
    }
  }

  async syncCapabilities(connectionId: string, modelNames: string[], forceRefresh = false) {
    const cache = this.getCapabilities(connectionId)
    const modelsToFetch = forceRefresh ? modelNames : modelNames.filter(name => !cache[name])

    if (modelsToFetch.length === 0) {
      return
    }

    const failedTotal = await progressStore.runList(
      modelsToFetch,
      'Syncing model capabilities',
      async modelName => {
        const { capabilities } = await this.show(modelName)
        cache[modelName] = capabilities || []
      },
    )

    this.setCapabilities(connectionId, cache)

    if (failedTotal > 0) {
      toastStore.addToast(
        `Failed to fetch capabilities for ${failedTotal}/${modelsToFetch.length} models. See console for details.`,
        'error',
      )
    }
  }

  async updateAll() {
    const models = (await this.ollama.list()).models

    const failedTotal = await progressStore.runList(models, 'Updating models', async model => {
      const progress = await this.pull(model.name, { isUpdate: true })

      if (progress.status === 'error') {
        throw new Error(`Failed to update ${model.name}`)
      }

      progressStore.delete(progress)
    })

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
      value: 0,
      label: model,
    })

    try {
      const stream = await this.ollama.pull({ model, stream: true })

      let percent = 0

      for await (const part of stream) {
        if (part.completed && part.total) {
          percent = Math.round((part.completed / part.total) * 100)

          progress.update({ value: percent })
        }

        if (percent === 100) {
          progress.update({ status: 'complete' })
        }

        progress.update({ subLabel: part.status || '' })
      }
    } catch (e) {
      progress.status = 'error'

      if (!isUpdate) {
        toastStore.addToast(`Something went wrong with pulling ${model}`, 'error', e)
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

        progress.update({ label: '', subLabel: 'Finished' })
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
