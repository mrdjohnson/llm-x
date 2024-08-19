import z from 'zod'

export const PersonaModel = z.object({
  id: z.string().cuid2(),
  name: z.string(),
  description: z.string(),
})

export type PersonaModel = z.infer<typeof PersonaModel>
