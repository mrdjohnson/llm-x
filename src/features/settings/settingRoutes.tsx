import { Route } from 'react-router-dom'
import { ReactNode } from 'react'

import GeneralPanel from '~/features/settings/panels/general/GeneralPanel'
import MobileSplashPanel from '~/features/settings/panels/MobileSplashPanel'
import HelpPanel from '~/features/settings/panels/help/HelpPanel'
import PersonaPanel from '~/features/settings/panels/PersonaPanel'

import ModelPanel, { ConnectionModelPanel } from '~/features/settings/panels/model/ModelPanel'
import ConnectionPanel from '~/features/settings/panels/connections/ConnectionPanel'
import { ParameterForm } from '~/features/settings/panels/connections/ConnectionParameterSection'

import { OllamaModelSettings } from '~/features/settings/panels/model/OllamaModelPanel'
import NewConnectionPanel from '~/features/settings/panels/connections/NewConnectionPanel'

export type SettingPanelOptionsType = 'general' | 'initial' | 'connection' | 'personas' | 'models'

export type SettingPanelType = {
  label: string
  subtitle?: string
  mobileOnly?: boolean
  Component: () => JSX.Element
  children?: ReactNode
}

export const settingRoutesByName: Record<SettingPanelOptionsType, SettingPanelType> = {
  general: { label: 'General', Component: GeneralPanel },
  initial: { label: 'Go to Section', Component: MobileSplashPanel, mobileOnly: true },
  connection: { label: 'How To Connect', Component: HelpPanel },
  models: {
    label: 'Models',
    subtitle: 'Select a Model',
    children: (
      <>
        <Route path="empty_panel" element={<NewConnectionPanel />} />

        <Route path="edit/:id" element={<ConnectionPanel />}>
          <Route path=":parameterId" element={<ParameterForm />} />
        </Route>

        <Route path=":id" element={<ConnectionModelPanel />}>
          <Route path="ollama/:modelName" element={<OllamaModelSettings />} />
        </Route>
      </>
    ),
    Component: ModelPanel,
  },
  personas: { label: 'Personas', subtitle: 'Select a Persona', Component: PersonaPanel },
}
