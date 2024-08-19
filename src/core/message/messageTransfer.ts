import _ from 'lodash'
import { z } from 'zod'

import { MessageModel } from '~/core/message/MessageModel'
import { messageTable } from '~/core/message/MessageTable'

import { addImageToCachedStorage } from '~/utils/addImageToCachedStorage'
import CachedStorage from '~/utils/CachedStorage'

const BaseExportedMessage = MessageModel.extend({
  images: z.array(z.string()),
}).omit({
  variationIds: true,
  imageUrls: true,
})

// zod Recursive type info: https://github.com/colinhacks/zod/issues/2406#issuecomment-1736000034
type ExportedMessageInput = z.input<typeof BaseExportedMessage> & {
  variations: ExportedMessageInput[]
}

export type ExportedMessage = z.output<typeof BaseExportedMessage> & {
  variations: ExportedMessage[]
}

export const ExportedMessage: z.ZodType<ExportedMessage, z.ZodTypeDef, ExportedMessageInput> =
  BaseExportedMessage.extend({
    variations: z.lazy(() => ExportedMessage.array()),
  })

export const importMessage = async (entity: unknown): Promise<MessageModel[]> => {
  const { data: exportedMessage } = ExportedMessage.safeParse(entity)

  if (!exportedMessage) return []

  const variations: MessageModel[] = []
  let selectedVariationId

  for (const legacyVariation of exportedMessage.variations) {
    const [variation] = await importMessage(legacyVariation)

    variations.push(variation)

    if (legacyVariation.id === exportedMessage.selectedVariationId) {
      selectedVariationId = variation.id
    }
  }

  const message: MessageModel = messageTable.parse({
    ...exportedMessage,
    variationIds: _.map(variations, 'id'),
    selectedVariationId,
  })

  const imageUrls: string[] = []

  for (const imageData of exportedMessage.images) {
    const imageUrl = await addImageToCachedStorage(message.id, { imageData })

    if (imageUrl) {
      imageUrls.push(imageUrl)
    }
  }

  await messageTable.put({ ...message, imageUrls })

  return [message, ...variations]
}

export const exportMessage = async (
  { variationIds, imageUrls, ...message }: MessageModel,
  options: Record<string, unknown> = {},
): Promise<ExportedMessage> => {
  const variationModels = await messageTable.findByIds(variationIds)

  const variations: ExportedMessage[] = []

  for (const variationModel of variationModels) {
    const variation = await exportMessage(variationModel, options)

    variations.push(variation)
  }

  const images: string[] = []

  if (options.includeImages) {
    for (const imageUrl of imageUrls) {
      const image = await CachedStorage.get(imageUrl)

      if (image) {
        images.push(image)
      }
    }
  }

  return {
    ...message,
    variations,
    images,
  }
}
