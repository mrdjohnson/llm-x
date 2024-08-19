import _ from 'lodash'
import { z } from 'zod'

import { MessageExtrasModel, MessageModel } from '~/core/message/MessageModel'
import { messageTable } from '~/core/message/MessageTable'

import { formatMessageDetails } from '~/utils/formatMessageDetails'
import { addImageToCachedStorage, moveCachedImageToMessage } from '~/utils/addImageToCachedStorage'

const LegacyMessageError = z.object({
  message: z.string().optional(),
  stack: z.string().optional(),
})

const LegacyMessageExtras = z.object({
  error: LegacyMessageError.optional(),
  detailString: z.string().optional(),
})

const BaseLegacyMessage = z.object({
  fromBot: z.boolean(),
  botName: z.string().nullable(),
  modelType: z.string().optional(),
  content: z.string(),
  uniqId: z.string(),
  selectedVariationIndex: z.number().optional(),
  showVariations: z.boolean().optional(),
  extras: LegacyMessageExtras.optional(),
  image: z.string().optional(),
  imageUrls: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
})

// zod Recursive type info: https://zod.dev/?id=recursive-types
type LegacyMessage = z.infer<typeof BaseLegacyMessage> & {
  variations?: LegacyMessage[]
}

export const LegacyMessage: z.ZodType<LegacyMessage> = BaseLegacyMessage.extend({
  variations: z.lazy(() => LegacyMessage.array()).optional(),
})

const getTimestampFromLegacyMessage = (message: LegacyMessage) => {
  const timestamp = message.uniqId.split('_')?.[1]

  return _.toNumber(timestamp) || 0
}

const cacheImagesToUrls = async ({
  oldImages,
  oldImageUrls,
  messageId,
}: {
  oldImages?: string[]
  oldImageUrls?: string[]
  messageId: string
}) => {
  const imageUrls: string[] = []

  try {
    if (!_.isEmpty(oldImageUrls)) {
      // rename the previous image
      for (const oldImageUrl of oldImageUrls!) {
        const imageUrl = await moveCachedImageToMessage(messageId, oldImageUrl)

        imageUrls.push(imageUrl)
      }

      return imageUrls
    }

    if (!_.isEmpty(oldImages)) {
      // add image to the CachedStorage, add the url to the list
      for (const oldImage of oldImages!) {
        const imageUrl = await addImageToCachedStorage(messageId, { imageData: oldImage })

        if (imageUrl) {
          imageUrls.push(imageUrl)
        }
      }
    }
  } catch (e) {
    console.error('could not extract or convert old images ', messageId)
  }

  return imageUrls
}

export const importLegacyMessage = async (entity: unknown): Promise<MessageModel[]> => {
  const { data: legacyMessage } = LegacyMessage.safeParse(entity)

  if (!legacyMessage) return []

  const variations: MessageModel[] = []

  if (legacyMessage.variations) {
    for (const legacyVariation of legacyMessage.variations) {
      const [variation] = await importLegacyMessage(legacyVariation)

      variations.push(variation)
    }
  }

  let selectedVariationId

  if (!_.isNil(legacyMessage.selectedVariationIndex)) {
    selectedVariationId = variations[legacyMessage.selectedVariationIndex]?.id
  }

  const oldExtras = legacyMessage.extras
  let extras: MessageExtrasModel | undefined = undefined

  if (oldExtras?.detailString) {
    try {
      const details = formatMessageDetails(JSON.parse(oldExtras.detailString))

      extras = { error: oldExtras.error, details }
    } catch (e) {
      console.error('could not format old extras: ', JSON.stringify(extras))
    }
  }

  const message: MessageModel = messageTable.parse({
    ...legacyMessage,
    variationIds: _.map(variations, 'id'),
    extras,
    selectedVariationId,
    timestamp: getTimestampFromLegacyMessage(legacyMessage),
  })

  const imageUrls: string[] = await cacheImagesToUrls({
    oldImages: _.toArray(legacyMessage.image ?? legacyMessage.images),
    oldImageUrls: legacyMessage.imageUrls,
    messageId: message.id,
  })

  await messageTable.put({ ...message, imageUrls })

  return [message, ...variations]
}
