import { LMStudioClient, type LLMChatHistoryMessage, LLMDynamicHandle } from '@lmstudio/sdk'

import { IMessageModel } from '~/models/MessageModel'
import { DefaultLmsHost, settingStore } from '~/models/SettingStore'
import { personaStore } from '~/models/PersonaStore'
import _ from 'lodash'

const getMessages = async (chatMessages: IMessageModel[], incomingMessage: IMessageModel) => {
  const messages: LLMChatHistoryMessage[] = []

  const selectedPersona = personaStore.selectedPersona

  if (selectedPersona) {
    messages.push({
      role: 'system',
      content: selectedPersona.description,
    })
  }

  for (const message of chatMessages) {
    if (message.uniqId === incomingMessage.uniqId) break

    const selectedVariation = message.selectedVariation

    if (message.fromBot) {
      messages.push({
        role: 'assistant',
        content: selectedVariation.content,
      })
    } else {
      messages.push({
        role: 'user',
        content: message.content,
      })
    }
  }

  return messages
}

export class LmsApi {
  private static abortControllerById: Record<string, () => Promise<void>> = {}

  static async *streamChat(
    chatMessages: IMessageModel[],
    incomingMessage: IMessageModel,
    incomingMessageVariant: IMessageModel,
  ) {
    const modelName = settingStore.selectedLmsModel?.path
    if (!modelName) return

    const messages = await getMessages(chatMessages, incomingMessage)

    const abortController = new AbortController()

    LmsApi.abortControllerById[incomingMessageVariant.uniqId] = async () => abortController.abort()
    const model = await LmsApi.getOrLoadModel(modelName, abortController)

    if (!model) {
      throw new Error('unable to find requested model: ' + modelName)
    }

    const prediction = model.respond(messages, {
      temperature: settingStore.lmsTemperature,
    })

    LmsApi.abortControllerById[incomingMessageVariant.uniqId] = () => prediction.cancel()

    for await (const text of prediction) {
      yield text
    }

    const { stats } = await prediction
    if (stats.stopReason === 'userStopped') {
      throw new Error('Stream ended manually')
    }

    incomingMessageVariant.setExtraDetails(stats)

    delete LmsApi.abortControllerById[incomingMessage.uniqId]
  }

  static async getOrLoadModel(modelPath: string, abortController: AbortController) {
    const lmsHost = settingStore.lmsHost || DefaultLmsHost
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
      
      model = await client.llm.load(modelPath, { signal: abortController.signal })
    }

    return model
  }

  static cancelStream(id?: string) {
    if (id) {
      if (!LmsApi.abortControllerById[id]) return

      LmsApi.abortControllerById[id]?.().then(() => {
        delete LmsApi.abortControllerById[id]
      })
    } else {
      for (const id in LmsApi.abortControllerById) {
        LmsApi.abortControllerById[id]?.()
      }

      LmsApi.abortControllerById = {}
    }
  }
}
