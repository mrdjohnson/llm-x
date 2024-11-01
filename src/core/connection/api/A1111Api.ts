import axios from 'axios'

import { IMessageModel } from '~/core/MessageModel'
import BaseApi from '~/core/connection/api/BaseApi'
import { connectionStore } from '~/core/connection/ConnectionStore'

class A1111Api extends BaseApi {
  async generateImages(prompt: string, incomingMessageVariant: IMessageModel): Promise<string[]> {
    const connection = connectionStore.selectedConnection
    const host = connection?.formattedHost

    if (!connection || !host) return []

    const abortController = new AbortController()

    BaseApi.abortControllerById[incomingMessageVariant.uniqId] = async () => abortController.abort()

    const parameters = connection.parsedParameters
    incomingMessageVariant.setExtraDetails({ sentWith: parameters })

    const response = await axios.post(
      host + '/sdapi/v1/txt2img',
      {
        prompt,
        hr_checkpoint_name: connectionStore.selectedModelName,
        ...parameters,
      },
      {
        signal: abortController.signal,
      },
    )

    const images: string[] | undefined = response.data.images

    if (!images) {
      throw new Error('A1111 API failed to return any generated image')
    }

    delete BaseApi.abortControllerById[incomingMessageVariant.uniqId]

    return images
  }

  generateChat(): AsyncGenerator<string> {
    throw new Error('Method not implemented.')
  }
}

const a1111Api = new A1111Api()

export default a1111Api
