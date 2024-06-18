import GeneralPanel from '~/features/settings/panels/general/GeneralPanel'
import MobileSplashPanel from '~/features/settings/panels/MobileSplashPanel'
import HelpPanel from '~/features/settings/panels/HelpPanel'
import PersonaPanel from '~/features/settings/panels/PersonaPanel'
import ModelPanel from '~/features/settings/panels/model/ModelPanel'
import ConnectionsPanel from '~/features/settings/panels/connections/ConnectionsPanel'
import ActorPanel from '~/features/settings/panels/actor/ActorPanel'

export type SettingPanelOptionsType =
  | 'general'
  | 'initial'
  | 'connection'
  | 'personas'
  | 'models'
  | 'connections'
  | 'actors'

export type SettingPanelType = {
  label?: string
  subtitle?: string
  mobileOnly?: boolean
  Component: () => JSX.Element
}

export const settingsPanelByName: Record<SettingPanelOptionsType, SettingPanelType> = {
  general: { label: 'General', Component: GeneralPanel },
  initial: { label: 'Go to Section', Component: MobileSplashPanel, mobileOnly: true },
  connections: { label: 'Connections', Component: ConnectionsPanel },
  connection: { label: 'How To Connect', Component: HelpPanel },
  actors: { label: 'Actors', subtitle: 'Actors', Component: ActorPanel },
  models: { label: 'Models', subtitle: 'Select a Model', Component: ModelPanel },
  personas: { label: 'Personas', subtitle: 'Select a Persona', Component: PersonaPanel },
}
