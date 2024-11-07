import z from 'zod'

export const ConnectionParameterModel = z.object({
  field: z.string(),
  label: z.string().optional(),
  defaultValue: z.string().optional(),
  helpText: z.string().optional(),
  types: z.array(
    z.union([z.literal('system'), z.literal('valueRequired'), z.literal('fieldRequired')]),
  ),
  value: z.string().optional(),

  // true if this should be json stringified before saving
  isJson: z.boolean().optional(),
})

export const ConnectionModel = z.object({
  id: z.string().cuid2(),
  label: z.string(),
  type: z.union([
    z.literal('LMS'),
    z.literal('A1111'),
    z.literal('Ollama'),
    z.literal('OpenAi'),
    z.literal('Gemini'),
  ]),
  host: z.string().optional(),
  enabled: z.boolean().default(true),
  parameters: z.array(ConnectionParameterModel),
})

export type ConnectionModel = z.infer<typeof ConnectionModel>
export type ConnectionTypes = ConnectionModel['type']
export type ConnectionModelInput = z.input<typeof ConnectionModel>
export type ConnectionParameterModel = z.infer<typeof ConnectionParameterModel>
