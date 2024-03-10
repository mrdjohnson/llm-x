import { useEffect, useState } from 'react'
import {
  KBarPortal,
  KBarPositioner,
  KBarAnimator,
  KBarSearch,
  KBarResults,
  useMatches,
  Priority,
  useRegisterActions,
  createAction,
} from 'kbar'
import type { Action, ActionImpl } from 'kbar'
import { autorun } from 'mobx'
import _ from 'lodash'

import { settingStore } from '../models/SettingStore'
import { personaStore } from '../models/PersonaStore'

const isSelected = ({ parent, id }: ActionImpl) => {
  if (parent === 'theme') {
    return id === settingStore.theme
  }

  if (parent === 'persona') {
    if (!personaStore.selectedPersona) return id === 'no_persona'

    return id === personaStore.selectedPersona.id.toString()
  }

  if (parent === 'model') {
    return id === settingStore.selectedModel?.name
  }

  return false
}

function RenderResults() {
  const { results } = useMatches()

  return (
    <KBarResults
      items={results}
      maxHeight={500}
      onRender={({ item, active }) => {
        if (typeof item === 'string') {
          return <div className="label-text p-2 font-semibold text-base-content/40">{item}</div>
        }

        const selected = isSelected(item)

        return (
          <button
            className={
              'w-full cursor-pointer justify-normal rounded-none border-l-2 border-l-transparent px-6 py-3 text-left text-base-content' +
              (item.ancestors[0] ? '' : '') +
              (active ? ' border-l-base-content/40 bg-base-200 ' : '') +
              (selected ? ' border-l-primary/40 ' : '')
            }
          >
            <span className=" text-base-content/70">
              {item.ancestors[0] && `   ${item.ancestors[0].name} > `}
            </span>

            <span className="font-semibold">{item.name}</span>
          </button>
        )
      }}
    />
  )
}

const useRegisterThemeActions = () => {
  useRegisterActions([
    {
      id: 'theme',
      name: 'Select Theme',
      keywords: 'interface color dark light',
      section: 'Preferences',
    },
    {
      id: 'dark',
      name: 'Dark',
      keywords: 'dark theme',
      section: 'Theme',
      perform: () => settingStore.setTheme('dark'),
      parent: 'theme',
    },
    {
      id: 'dracula',
      name: 'Dracula',
      keywords: 'dracula theme',
      section: 'Theme',
      perform: () => settingStore.setTheme('dracula'),
      parent: 'theme',
    },
    {
      id: 'garden',
      name: 'Light',
      keywords: 'light garden theme',
      section: 'Theme',
      perform: () => settingStore.setTheme('garden'),
      parent: 'theme',
    },
  ])
}

const useRegisterModelActions = () => {
  const [modelActions, setModelActions] = useState<Action[]>([])

  useEffect(() => {
    autorun(() => {
      const nextModelActions: Action[] = []

      if (_.isEmpty(settingStore.models)) {
        nextModelActions.push({
          id: 'model',
          name: 'No Models to select: Refresh',
          keywords: 'model modal open select refresh',
          section: 'Actions',
          priority: Priority.LOW,
          perform: settingStore.updateModels,
        })
      } else {
        nextModelActions.push({
          id: 'model',
          name: 'Select Model',
          keywords: 'model modal open select',
          section: 'Preferences',
          priority: Priority.HIGH,
        })

        nextModelActions.push({
          id: 'model_modal',
          name: 'Open Model Selector',
          keywords: 'model modal open select',
          section: 'Actions',
          priority: Priority.LOW,
          perform: settingStore.openModelSelectionModal,
        })
      }

      settingStore.models.forEach(model => {
        nextModelActions.push({
          id: model.name,
          name: model.name,
          keywords: `${model.name} model ${model.details.parameterSize}`,
          section: 'Models',
          perform: () => settingStore.selectModel(model.name),
          parent: 'model',
        })
      })

      setModelActions(nextModelActions)
    })
  }, [])

  useRegisterActions(modelActions, [modelActions])
}

const useRegisterPersonaActions = () => {
  const [personaActions, setPersonaActions] = useState<Action[]>([])

  useEffect(() => {
    autorun(() => {
      const nextPersonaActions: Action[] = [
        {
          id: 'persona',
          name: 'Select Persona',
          keywords: 'persona open select',
          section: 'Preferences',
          priority: Priority.HIGH,
        },
        {
          id: 'persona_modal',
          name: 'Open Persona Selector',
          keywords: 'persona open select',
          section: 'Actions',
          priority: Priority.LOW,
          perform: personaStore.openSelectionModal,
        },
      ]

      if (!_.isEmpty(personaStore.personas)) {
        nextPersonaActions.push({
          id: 'no_persona',
          name: 'Default/No Persona',
          keywords: `clear default no remove delete persona`,
          section: 'Personas',
          priority: Priority.HIGH,
          perform: () => personaStore.setSelectedPersona(undefined),
          parent: 'persona',
        })
      }

      personaStore.personas.forEach(persona => {
        nextPersonaActions.push({
          id: persona.id.toString(),
          name: persona.name,
          keywords: `${persona.name} persona`,
          section: 'Personas',
          perform: () => personaStore.setSelectedPersona(persona),
          parent: 'persona',
        })
      })

      setPersonaActions(nextPersonaActions)
    })
  }, [])

  useRegisterActions(personaActions, [personaActions])
}

const OmniBar = () => {
  useRegisterThemeActions()
  useRegisterModelActions()
  useRegisterPersonaActions()

  useRegisterActions([
    createAction({
      name: 'Refresh models',
      keywords: 'refresh',
      section: 'Actions',
      priority: Priority.LOW,
      perform: settingStore.updateModels,
    }),
  ])

  return (
    <KBarPortal>
      <KBarPositioner>
        <KBarAnimator className="inline-table w-[50%] transform-none overflow-hidden rounded-lg border-2 border-base-content/30 bg-base-100 p-2 shadow-xl">
          <KBarSearch className=" input w-full rounded-none border-0 border-b border-base-content/30 px-4 pb-2 text-base-content focus:outline-none" />

          <RenderResults />
        </KBarAnimator>
      </KBarPositioner>
    </KBarPortal>
  )
}

export default OmniBar
