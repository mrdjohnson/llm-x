import { z } from 'zod'

export const ActorModel = z.object({
  id: z.string().cuid2(),
  name: z.string().optional(),
  connectionId: z.string().nullish(),
  modelId: z.string().nullish(),
  chatId: z.string().nullish(),
  resourceIds: z.array(z.string()).default([]),
})

export type ActorModel = z.infer<typeof ActorModel>
