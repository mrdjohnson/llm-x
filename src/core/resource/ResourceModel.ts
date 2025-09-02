import { z } from 'zod'

export const ResourceModel = z.object({
  id: z.string().cuid2(),
  name: z.string().default('New Resource'),
  timestamp: z.number().default(() => Date.now()),
  // documents could take up a lot of memory, maybe this should be its own table?
  documentId: z.string(),
  source: z.string(),
  sourceType: z.union([z.literal('file'), z.literal('url'), z.literal('live')]),
})

export type ResourceModel = z.infer<typeof ResourceModel>
export type ResourceModelInput = z.input<typeof ResourceModel>
