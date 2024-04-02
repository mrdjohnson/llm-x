import axios from 'axios'

import { DefaultA1111Host, settingStore } from '~/models/SettingStore'

export class A1111Api {
  private static abortController?: AbortController

  static async generateImage(prompt: string): Promise<string> {
    const host = settingStore.a1111Host || DefaultA1111Host

    A1111Api.abortController = new AbortController()

    const response = await axios.post(
      host + '/sdapi/v1/txt2img',
      {
        prompt,
        steps: settingStore.a1111Steps,
        width: settingStore.a1111Width,
        height: settingStore.a1111Height,
        hr_checkpoint_name: settingStore.selectedModelLabel,
      },
      {
        signal: A1111Api.abortController.signal,
      },
    )

    const image: string | undefined = response.data.images?.[0]

    if (!image) {
      throw new Error('A1111 API failed to return any generated image')
    }

    this.abortController = undefined

    return image!
  }

  static cancelGeneration() {
    if (!A1111Api.abortController) return

    A1111Api.abortController.abort('Stream ended manually')

    A1111Api.abortController = undefined
  }
}
