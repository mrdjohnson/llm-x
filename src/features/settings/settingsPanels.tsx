import General from '~/features/settings/panels/General'
import MobileSplashPanel from '~/features/settings/panels/MobileSplashPanel'
import HelpPanel from '~/features/settings/panels/HelpPanel'
import PersonaPanel from '~/features/settings/panels/PersonaPanel'

export type SettingPanelOptionsType = 'general' | 'initial' | 'connection' | 'personas'
export type SettingPanelType = {
  label: string
  subtitle?: string
  mobileOnly?: boolean
  Component: () => JSX.Element
}

export const settingsPanelByName: Record<SettingPanelOptionsType, SettingPanelType> = {
  general: { label: 'General', Component: General },
  initial: { label: 'Go to Section', Component: MobileSplashPanel, mobileOnly: true },
  connection: { label: 'How To Connect', Component: HelpPanel },
  personas: { label: 'Personas', subtitle: 'Select a Persona', Component: PersonaPanel },
}
