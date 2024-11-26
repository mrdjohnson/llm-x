import { z } from 'zod'

export const ActorModel = z.object({
  id: z.string().cuid2(),
  name: z.string().optional(),
  connectionId: z.string().nullish(),
  modelId: z.string().nullish(),
  chatId: z.string().nullish(),
})

export type ActorModel = z.infer<typeof ActorModel>
