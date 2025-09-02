import { z } from 'zod'

export const DocumentModel = z.object({
  id: z.string().cuid2(),
  data: z.array(z.record(z.any())).default([]),
})

export type DocumentModel = z.infer<typeof DocumentModel>
