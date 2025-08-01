import z from 'zod'
import moment from 'moment'
import { getThemeKeys } from '~/utils/themeConfig'

export const CURRENT_DB_TIMESTAMP = moment('Oct 28 24', 'MMM DD YY')
export const CURRENT_DB_TIMESTAMP_MILLISECONDS = CURRENT_DB_TIMESTAMP.valueOf()

const themeKeys = getThemeKeys() as [string, ...string[]]
const ThemeOptions = z.enum(themeKeys)

export const SettingModel = z.object({
  // setting row will only have one field
  id: z.string().default('setting'),

  // general settings
  theme: ThemeOptions.default('dracula'),
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
