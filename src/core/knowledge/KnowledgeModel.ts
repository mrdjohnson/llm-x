import moment from 'moment'
import z from 'zod'

import { ConnectionParameterModel } from '~/core/connection/ConnectionModel'

export const KnowledgeModel = z.object({
  id: z.string().cuid2(),
  name: z.string().default('New Knowledge'),
  documents: z.array(z.string()).default([]),
  source: z.string(),
  sourceType: z.union([z.literal('file'), z.literal('url'), z.literal('live')]),
  timestamp: z.number().default(() => moment.now()),
  parameters: z.array(ConnectionParameterModel),
})

export type KnowledgeModel = z.infer<typeof KnowledgeModel>
export type KnowledgeModelInput = z.input<typeof KnowledgeModel>
