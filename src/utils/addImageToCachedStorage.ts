import { createId } from '@paralleldrive/cuid2'
import _ from 'lodash'

import base64EncodeImage from '~/utils/base64EncodeImage'
import CachedStorage from '~/utils/CachedStorage.platform'

const createImageUrl = (messageId: string) => {
  return `/llm-x/message/${messageId}/${createId()}.png`
}

export const moveCachedImageToMessage = async (messageId: string, previewUrl: string) => {
  const url = createImageUrl(messageId)

  await CachedStorage.move(previewUrl, url)

  return url
}

export const addImageToCachedStorage = async (
  messageId: string | undefined,
  { imageData, imageFile }: { imageData?: string; imageFile?: File },
) => {
  if (!imageData && !imageFile) return undefined

  let url

  if (messageId) {
    url = createImageUrl(messageId)
  } else {
    // full path is set on attachment
    url = `/llm-x/${_.uniqueId('preview-image-')}`
  }

  let image = imageData

  if (!image) {
    // real name is set on attachment
    image = await base64EncodeImage(imageFile!)
  }

  await CachedStorage.put(url, image)

  return url
}
