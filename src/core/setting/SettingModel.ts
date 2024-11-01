import z from 'zod'
import moment from 'moment'

export const CURRENT_DB_TIMESTAMP = moment('Oct 28 24', 'MMM DD YY')
export const CURRENT_DB_TIMESTAMP_MILLISECONDS = CURRENT_DB_TIMESTAMP.valueOf()

const ThemeOptions = z.union([
  z.literal('_system'),
  z.literal('dark'),
  z.literal('dracula'),
  z.literal('garden'),
])

export const SettingModel = z.object({
  // setting row will only have one field
  id: z.string().default('setting'),

  // general settings
  theme: ThemeOptions.default('_system'),
  isSidebarOpen: z.boolean().default(true),

  // connection settings
  selectedConnectionId: z.string().optional(),
  selectedModelId: z.string().optional(),

  // persona settings
  selectedPersonaId: z.string().nullish(),

  // chat settings
  selectedChatId: z.string().optional(),

  // voice settings
  selectedVoiceId: z.string().optional(),

  // migration settings
  databaseTimestamp: z.number().default(CURRENT_DB_TIMESTAMP_MILLISECONDS),
})

export type SettingModel = z.infer<typeof SettingModel>
