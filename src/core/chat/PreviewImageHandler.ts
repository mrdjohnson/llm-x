import _ from 'lodash'
import { observable } from 'mobx'

import CachedStorage from '~/utils/CachedStorage.platform'
import { toastStore } from '~/core/ToastStore'
import { addImageToCachedStorage, moveCachedImageToMessage } from '~/utils/addImageToCachedStorage'
import { MessageViewModel } from '~/core/message/MessageViewModel'

type PreviewImage = {
  url: string
  isNew?: boolean
  isDeleted?: boolean
}

export class PreviewImageHandler {
  previewImages = observable.array<PreviewImage>()
  messageId?: string

  get list() {
    return _.filter(this.previewImages, previewImage => !previewImage.isDeleted)
  }

  async setMessage(message?: MessageViewModel) {
    await this.cancelPreviewImages()

    if (message) {
      for (const url of message.source.imageUrls) {
        this.previewImages.push({ url })
      }
    }

    this.messageId = message?.id
  }

  async removePreviewImage(previewImage: PreviewImage) {
    previewImage.isDeleted = true

    if (previewImage.isNew) {
      await this.destroyImage(previewImage)
    }
  }

  async removePreviewImages(previewImages: PreviewImage[]) {
    for (const previewImage of previewImages) {
      await this.removePreviewImage(previewImage)
    }
  }

  async addPreviewImage(file: File) {
    try {
      const url = await addImageToCachedStorage(this.messageId, { imageFile: file })

      if (url) {
        this.previewImages.push({ url, isNew: true })
      }
    } catch (e) {
      toastStore.addToast('Unable to read image', 'error', e)

      console.error(e)
    }
  }

  async cancelPreviewImages() {
    // remove the new images from the browser cache
    for (const previewImage of this.previewImages) {
      if (previewImage.isNew) {
        await this.destroyImage(previewImage)
      }
    }

    this.clearImagePreviews()
  }

  async commitPreviewImages(newMessageId?: string) {
    const committedPreviewImages: string[] = []

    const messageId = newMessageId || this.messageId

    for (const previewImage of this.previewImages) {
      if (previewImage.isDeleted) {
        await this.destroyImage(previewImage)

        continue
      }

      let imageUrl = previewImage.url

      if (previewImage.isNew && messageId) {
        imageUrl = await moveCachedImageToMessage(messageId, previewImage.url)
      }

      committedPreviewImages.push(imageUrl)
    }

    this.clearImagePreviews()

    return committedPreviewImages
  }

  async destroyImage(previewImage: PreviewImage) {
    await CachedStorage.delete(previewImage.url)

    _.remove(this.previewImages, previewImage)
  }

  clearImagePreviews() {
    this.previewImages.clear()
    this.messageId = undefined
  }
}
