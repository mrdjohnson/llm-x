import axios from 'axios'

import { MessageViewModel } from '~/core/message/MessageViewModel'
import BaseApi from '~/core/connection/api/BaseApi'

class A1111Api extends BaseApi {
  async generateImages(
    prompt: string,
    incomingMessageVariant: MessageViewModel,
  ): Promise<string[]> {
    const connection = incomingMessageVariant.actor.connection
    const host = connection?.formattedHost

    const actor = incomingMessageVariant.actor
    const model = actor.modelName

    if (!connection || !host || !model) return []

    const abortController = new AbortController()

    BaseApi.abortControllerById[incomingMessageVariant.id] = async () => abortController.abort()

    const parameters = connection.parsedParameters
    await incomingMessageVariant.setExtraDetails({ sentWith: parameters })

    const response = await axios.post(
      host + '/sdapi/v1/txt2img',
      {
        prompt,
        hr_checkpoint_name: model,
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

    delete BaseApi.abortControllerById[incomingMessageVariant.id]

    return images
  }

  generateChat(): AsyncGenerator<string> {
    throw new Error('Method not implemented.')
  }
}

export const baseApi = new A1111Api()
