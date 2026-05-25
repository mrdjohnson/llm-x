import axios from 'axios'

import { MessageViewModel } from '~/core/message/MessageViewModel'
import BaseApi from '~/core/connection/api/BaseApi'
import CachedStorage from '~/utils/CachedStorage.platform'

class A1111Api extends BaseApi {
  async generateImages(
    messageToSend: MessageViewModel,
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

    const hasImageUrls = messageToSend.source.imageUrls.length > 0

    const imagesToSend: { init_images?: string[] } = hasImageUrls ? { init_images: [] } : {}

    for (const cachedImageUrl of messageToSend.source.imageUrls) {
      const imageData = await CachedStorage.get(cachedImageUrl)

      if (imageData) {
        imagesToSend.init_images!.push(imageData.substring('data:image/png;base64,'.length))
      }
    }

    const endpoint = hasImageUrls ? '/sdapi/v1/img2img' : '/sdapi/v1/txt2img'

    const response = await axios.post(
      host + endpoint,
      {
        prompt: messageToSend.content,
        hr_checkpoint_name: model,
        ...imagesToSend,
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
