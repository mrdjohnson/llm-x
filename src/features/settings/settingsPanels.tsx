import General from '~/features/settings/panels/General'
import MobileSplashPanel from '~/features/settings/panels/MobileSplashPanel'

export type SettingPanelOptionsType = 'general' | 'initial'
export type SettingPanelType = {
  label: string
  subtitle?: string
  mobileOnly?: boolean
  Component: () => JSX.Element
}

export const settingsPanelByName: Record<SettingPanelOptionsType, SettingPanelType> = {
  general: { label: 'General', Component: General },
  initial: { label: 'Go to Section', Component: MobileSplashPanel, mobileOnly: true },
}
