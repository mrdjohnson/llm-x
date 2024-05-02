import axios from 'axios'

import { DefaultA1111Host, settingStore } from '~/models/SettingStore'
import { IMessageModel } from '~/models/MessageModel'

export class A1111Api {
  private static abortControllerById: Record<string, AbortController> = {}

  static async generateImage(prompt: string, incomingMessage: IMessageModel): Promise<string[]> {
    const host = settingStore.a1111Host || DefaultA1111Host

    const abortController = new AbortController()

    A1111Api.abortControllerById[incomingMessage.uniqId] = abortController

    const response = await axios.post(
      host + '/sdapi/v1/txt2img',
      {
        prompt,
        steps: settingStore.a1111Steps,
        width: settingStore.a1111Width,
        height: settingStore.a1111Height,
        hr_checkpoint_name: settingStore.selectedModelLabel,
        batch_size: settingStore.a1111BatchSize,
      },
      {
        signal: abortController.signal,
      },
    )

    const images: string[] | undefined = response.data.images

    if (!images) {
      throw new Error('A1111 API failed to return any generated image')
    }

    delete A1111Api.abortControllerById[incomingMessage.uniqId]

    return images
  }

  static cancelStream(id?: string) {
    if (id) {
      if (!A1111Api.abortControllerById[id]) return

      A1111Api.abortControllerById[id].abort('Stream ended manually')

      delete A1111Api.abortControllerById[id]
    } else {
      for (const id in A1111Api.abortControllerById) {
        A1111Api.abortControllerById[id].abort('Stream ended manually')
      }

      A1111Api.abortControllerById = {}
    }
  }
}
