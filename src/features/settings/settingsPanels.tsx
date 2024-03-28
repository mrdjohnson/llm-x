import General from '~/features/settings/panels/General'
import HelpPanel from '~/features/settings/panels/HelpPanel'
import MobileSplashPanel from '~/features/settings/panels/MobileSplashPanel'
import OllamaModelPanel from '~/features/settings/panels/OllamaModelPanel'
import PersonaPanel from '~/features/settings/panels/PersonaPanel'

export type SettingPanelOptionsType = 'general' | 'models' | 'personas' | 'connection' | 'initial'
export type SettingPanelType = {
  label: string
  subtitle?: string
  mobileOnly?: boolean
  Component: () => JSX.Element
}

export const settingsPanelByName: Record<SettingPanelOptionsType, SettingPanelType> = {
  connection: { label: 'How To Connect', Component: HelpPanel },
  general: { label: 'General', Component: General },
  models: { label: 'Models', subtitle: 'Select a Model', Component: OllamaModelPanel },
  personas: { label: 'Personas', subtitle: 'Select a Persona', Component: PersonaPanel },
  initial: { label: 'Go to Section', Component: MobileSplashPanel, mobileOnly: true },
}
