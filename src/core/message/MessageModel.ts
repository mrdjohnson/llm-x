import moment from 'moment'
import z from 'zod'

export const MessageErrorModel = z.object({
  message: z.string().optional(),
  stack: z.string().optional(),
})

export const MessageExtrasModel = z.object({
  error: MessageErrorModel.optional(),
  details: z.string().optional(),
})

export const MessageModel = z.object({
  id: z.string().cuid2(),
  fromBot: z.boolean(),
  timestamp: z
    .number()
    .optional()
    .default(() => moment.now()),
  botName: z.string().nullish(),
  modelType: z.string().optional(),
  content: z.string().optional().default(''),
  extras: MessageExtrasModel.optional(),
  imageUrls: z.array(z.string()).optional().default([]),
  selectedVariationId: z.string().optional(),

  variationIds: z.array(z.string()).optional().default([]),
})

export type MessageModel = z.infer<typeof MessageModel>
export type MessageExtrasModel = z.infer<typeof MessageExtrasModel>
