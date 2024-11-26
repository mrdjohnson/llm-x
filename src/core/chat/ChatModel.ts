import moment from 'moment'
import z from 'zod'

export const ChatModel = z.object({
  id: z.string().cuid2(),
  name: z.string().default('New Chat'),
  messageIds: z.array(z.string()).default([]),
  lastMessageTimestamp: z.number().default(() => moment.now()),
  actorIds: z.array(z.string()).optional().default([]),
})

export type ChatModel = z.infer<typeof ChatModel>
export type ChatModelInput = z.input<typeof ChatModel>
