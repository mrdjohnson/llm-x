import z from 'zod'

export const VoiceModel = z.object({
  id: z.string().cuid2(),
  language: z.string().optional(),
  voiceUri: z.string().optional(),
})

export type VoiceModel = z.infer<typeof VoiceModel>