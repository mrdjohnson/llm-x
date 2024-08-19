import { LMStudioClient, type ChatMessageData, LLMDynamicHandle } from '@lmstudio/sdk'
import _ from 'lodash'

import { progressStore } from '~/features/progress/ProgressStore'

import BaseApi from '~/core/connection/api/BaseApi'
import { MessageViewModel } from '~/core/message/MessageViewModel'
import { personaStore } from '~/core/persona/PersonaStore'
import { connectionStore } from '~/core/connection/ConnectionStore'

const getMessages = async (chatMessages: MessageViewModel[], chatMessageId: string) => {
  const messages: ChatMessageData[] = []

  const selectedPersona = personaStore.selectedPersona

  if (selectedPersona) {
    messages.push({
      role: 'system',
      content: [{ type: 'text', text: selectedPersona.description }],
    })
  }

  for (const message of chatMessages) {
    if (message.id === chatMessageId) break

    const selectedVariation = message.selectedVariation

    if (message.source.fromBot) {
      messages.push({
        role: 'assistant',
        content: [{ type: 'text', text: selectedVariation.content }],
      })
    } else {
      messages.push({
        role: 'user',
        content: [{ type: 'text', text: selectedVariation.content }],
      })
    }
  }

  return messages
}

export class LmsApi extends BaseApi {
  async *generateChat(chatMessages: MessageViewModel[], incomingMessageVariant: MessageViewModel) {
    const connection = connectionStore.selectedConnection
    const host = connection?.formattedHost

    const modelName = connectionStore.selectedModelName
    if (!connection || !host || !modelName) return

    const messages = await getMessages(chatMessages, incomingMessageVariant.rootMessage.id)

    const abortController = new AbortController()

    BaseApi.abortControllerById[incomingMessageVariant.id] = async () => abortController.abort()
    const model = await this.getOrLoadModel(host, modelName, abortController)

    if (!model) {
      throw new Error('unable to find requested model: ' + modelName)
    }

    const prediction = model.respond({ messages }, connection.parsedParameters)
    await incomingMessageVariant.setExtraDetails({ sentWith: connection.parsedParameters })

    BaseApi.abortControllerById[incomingMessageVariant.id] = () => prediction.cancel()

    for await (const text of prediction) {
      yield text
    }

    const { stats } = await prediction
    if (stats.stopReason === 'userStopped') {
      throw new Error('Stream ended manually')
    }

    await incomingMessageVariant.setExtraDetails({
      sentWith: connection.parsedParameters,
      returnedWith: stats,
    })

    delete BaseApi.abortControllerById[incomingMessageVariant.id]
  }

  async getOrLoadModel(host: string, modelPath: string, abortController: AbortController) {
    const lmsHost = host
    const client = new LMStudioClient({ baseUrl: lmsHost })

    let model: LLMDynamicHandle | undefined = undefined

    const loadedModels = await client.llm.listLoaded()

    if (!_.isEmpty(loadedModels)) {
      const loadedModelDescriptor = _.find(loadedModels, { path: modelPath })

      if (loadedModelDescriptor) {
        console.log('using pre-loaded lmstudio model', modelPath)
        model = await client.llm.get({ path: modelPath })
      }
    }

    if (!model) {
      console.log('loading lmstudio model', modelPath)

      const loadProgress = progressStore.create({ label: '0%', subLabel: `Loading: ${modelPath}` })

      model = await client.llm.load(modelPath, {
        signal: abortController.signal,
        onProgress: progress => {
          const progressPercent = Math.round(progress * 100)

          loadProgress.update({ label: `${progressPercent}%` })
        },
      })

      loadProgress.update({ label: '100%' })
      progressStore.delete(loadProgress, { shouldDelay: true })
    }

    return model
  }

  generateImages(): Promise<string[]> {
    throw 'unsupported'
  }
}

const lmsApi = new LmsApi()

export default lmsApi
