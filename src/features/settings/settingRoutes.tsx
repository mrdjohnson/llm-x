import { Route } from 'react-router-dom'
import { FunctionComponent, ReactNode } from 'react'

import GeneralPanel from '~/features/settings/panels/general/GeneralPanel'
import MobileSplashPanel from '~/features/settings/panels/MobileSplashPanel'
import HelpPanel, { ConnectionHelpPanel } from '~/features/settings/panels/help/HelpPanel'
import PersonaPanel from '~/features/settings/panels/persona/PersonaPanel'

import ModelPanel, { ConnectionModelPanel } from '~/features/settings/panels/model/ModelPanel'
import ConnectionPanel from '~/features/settings/panels/connections/ConnectionPanel'
import { ParameterForm } from '~/features/settings/panels/connections/ConnectionParameterSection'
import { PersonaForm } from '~/features/settings/panels/persona/PersonaForm'
import { OllamaModelSettings } from '~/features/settings/panels/model/OllamaModelPanel'
import NewConnectionPanel from '~/features/settings/panels/connections/NewConnectionPanel'
import { ChatForm } from '~/features/settings/panels/chat/ChatForm'
import ChatPanel from '~/features/settings/panels/chat/ChatPanel'
import { ActorForm } from '~/features/settings/panels/actor/ActorForm'

export type SettingPanelOptionsType =
  | 'general'
  | 'initial'
  | 'connection'
  | 'personas'
  | 'models'
  | 'chats'

export type SettingPanelType = {
  label: string
  subtitle?: string
  mobileOnly?: boolean
  Component: FunctionComponent
  children?: ReactNode
}

export const settingRoutesByName: Record<SettingPanelOptionsType, SettingPanelType> = {
  initial: { label: 'Chats', Component: MobileSplashPanel, mobileOnly: true },
  general: { label: 'General', Component: GeneralPanel },
  connection: {
    label: 'How To Connect',
    Component: HelpPanel,
    children: (
      <>
        <Route path=":id" element={<ConnectionHelpPanel />} />
      </>
    ),
  },
  models: {
    label: 'Models',
    subtitle: 'Select a Model',
    children: (
      <>
        <Route path="empty_panel" element={<NewConnectionPanel />} />

        <Route path="edit/:id" element={<ConnectionPanel />}>
          <Route path="parameter/:parameterId" element={<ParameterForm />} />
        </Route>

        <Route path=":id" element={<ConnectionModelPanel />}>
          <Route path="ollama/:modelName" element={<OllamaModelSettings />} />
        </Route>
      </>
    ),
    Component: ModelPanel,
  },
  chats: {
    label: 'Chats',
    Component: ChatPanel,
    children: (
      <>
        <Route path=":id" element={<ChatForm />}>
          <Route path="actor/:id" element={<ActorForm />} />
        </Route>
      </>
    ),
  },
  personas: {
    label: 'Personas',
    subtitle: 'Select a Persona',
    Component: PersonaPanel,
    children: (
      <>
        <Route path=":id" element={<PersonaForm />} />
      </>
    ),
  },
}
