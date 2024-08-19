import { BaseTable } from '~/core/BaseTable'
import { MessageModel } from '~/core/message/MessageModel'
import CachedStorage from '~/utils/CachedStorage'

import { exportMessage, importMessage } from '~/core/message/messageTransfer'

export const MessageTableName = 'Message' as const

class MessageTable extends BaseTable<typeof MessageModel> {
  schema = MessageModel

  hasParentExportTable = true

  getTableName() {
    return MessageTableName
  }

  async destroy(message: MessageModel) {
    // destroy images
    for (const imageUrl of message.imageUrls) {
      await CachedStorage.delete(imageUrl)
    }

    // destroy variations
    for (const variationId of message.variationIds) {
      const variation = await this.findById(variationId)

      if (variation) {
        await this.destroy(variation)
      }
    }

    return super.destroy(message)
  }

  async destroyMany(ids: string[]) {
    for (const id of ids) {
      const message = await this.findById(id)

      if (!message) continue

      await this.destroy(message)
    }
  }

  async export(message: MessageModel, options: Record<string, unknown> = {}) {
    return exportMessage(message, options)
  }

  async import(data: unknown) {
    importMessage(data)
  }
}

export const messageTable = new MessageTable()
