import { useEffect, useState } from 'react'
import { KBarResults, useMatches, Priority, useRegisterActions, createAction, useKBar } from 'kbar'
import type { Action, ActionImpl } from 'kbar'
import { autorun } from 'mobx'
import _ from 'lodash'
import { useNavigate } from 'react-router-dom'
import { twMerge } from 'tailwind-merge'
import localForage from 'localforage'

// @ts-expect-error tiny keys does not export ts well right now https://github.com/jamiebuilds/tinykeys/issues/191
import { tinykeys } from 'tinykeys'

import { settingStore } from '~/core/setting/SettingStore'
import { personaStore } from '~/core/persona/PersonaStore'
import { chatStore } from '~/core/chat/ChatStore'
import { connectionStore } from '~/core/connection/ConnectionStore'

import { messageTable } from '~/core/message/MessageTable'
import themes from 'daisyui/src/theming/themes'

const isSelected = ({ parent, id }: ActionImpl) => {
  if (parent === 'theme') {
    return id === settingStore.setting.theme
  }

  if (parent === 'persona') {
    if (!personaStore.selectedPersona) return id === 'no_persona'

    return id === settingStore.setting.selectedPersonaId
  }

  if (parent === 'model') {
    return id === settingStore.setting.selectedModelId
  }

  if (parent === 'chat') {
    return id === settingStore.setting.selectedChatId
  }

  return false
}

export function RenderResults() {
  const { results } = useMatches()

  return (
    <KBarResults
      items={results}
      maxHeight={1200}
      onRender={({ item, active }) => {
        if (typeof item === 'string') {
          return <div className="label-text p-2 font-semibold text-base-content/40">{item}</div>
        }

        if (item.name === '') {
          return (
            <div className="label-text p-2 font-semibold text-base-content/40">{item.subtitle}</div>
          )
        }

        const selected = isSelected(item)

        return (
          <button
            className={twMerge(
              'w-full cursor-pointer justify-normal rounded-none border-l-2 border-l-transparent px-6 py-3 text-left text-base-content',
              active && 'border-l-base-content/40 bg-base-200',
              selected && 'border-l-primary/40',
            )}
          >
            <span className="text-base-content/70">
              {item.ancestors[0] && `   ${item.ancestors[0].name} > `}
            </span>

            <span className="font-semibold">{item.name}</span>

            {item.subtitle && (
              <>
                <br />
                <span className="text-sm text-base-content/70">{item.subtitle}</span>
              </>
            )}
          </button>
        )
      }}
    />
  )
}

const useRegisterThemeActions = () => {
  const themeNames = Object.keys(themes)

  const themeActions = themeNames.map(theme => ({
    id: theme,
    name: theme.charAt(0).toUpperCase() + theme.slice(1),
    keywords: `${theme} theme`,
    section: 'Theme',
    perform: async () => settingStore.update({ theme }),
    parent: 'theme',
  }))

  // Optionally add a "System" theme
  themeActions.push({
    id: '_system',
    name: 'System',
    keywords: 'system theme',
    section: 'Theme',
    perform: async () => settingStore.update({ theme: '_system' }),
    parent: 'theme',
  })

  useRegisterActions([
    {
      id: 'theme',
      name: 'Select Theme',
      keywords: 'interface color dark light',
      section: 'Preferences',
    },
    ...themeActions,
  ])
}

const useRegisterModelActions = () => {
  const navigate = useNavigate()

  const [modelActions, setModelActions] = useState<Action[]>([])

  useEffect(() => {
    autorun(() => {
      const nextModelActions: Action[] = []

      nextModelActions.push({
        id: 'model',
        name: 'Select Model',
        keywords: 'model modal open select',
        section: 'Preferences',
        priority: Priority.HIGH,
      })

      nextModelActions.push({
        id: 'refresh_models',
        name: 'Refresh models',
        keywords: 'refresh',
        section: 'Actions',
        priority: Priority.LOW,
      })

      nextModelActions.push({
        id: 'refresh_all_models',
        name: 'Refresh all models',
        keywords: 'refresh',
        priority: Priority.HIGH,
        parent: 'refresh_models',
        perform: () => connectionStore.refreshModels(),
      })

      for (const connection of connectionStore.connections) {
        if (!connection.source.enabled) continue

        const typeAndLabel = `${connection.type} ${connection.label}`

        nextModelActions.push({
          id: 'refresh' + connection.id,
          name: `Refresh models for ${connection.label}: (${connection.models.length} found)`,
          keywords: `model refresh ` + typeAndLabel,
          priority: Priority.LOW,
          perform: () => connection.fetchLmModels(),
          parent: 'refresh_models',
        })

        connection.models.forEach(model => {
          nextModelActions.push({
            id: model.id,
            name: model.modelName,
            keywords: `${model.modelName} model ` + typeAndLabel,
            section: connection.label + ' Models',
            parent: 'model',
            perform: () => connectionStore.setSelectedModel(model.id, connection.id),
          })
        })
      }

      nextModelActions.push({
        id: 'model_modal',
        name: 'Open Model Selector',
        keywords: 'model modal open select',
        section: 'Actions',
        priority: Priority.LOW,
        shortcut: ['$mod+.'],
        perform: () => navigate('/models'),
      })

      setModelActions(nextModelActions)
    })
  }, [])

  useRegisterActions(modelActions, [modelActions])
}

const useRegisterPersonaActions = () => {
  const navigate = useNavigate()

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
          shortcut: ['$mod+Shift+.'],
          perform: () => navigate('personas'),
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
          id: persona.id,
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

const useRegisterChatActions = () => {
  const [chatOptions, setChatOptions] = useState<Action[]>([])

  useEffect(() => {
    autorun(() => {
      const nextChatActions: Action[] = [
        {
          id: 'chat',
          name: 'Select Chat',
          keywords: 'search chat select',
          section: 'Chats',
        },
      ]

      chatStore.orderedChats.forEach(chat => {
        const name = chat.name || 'new chat'

        return nextChatActions.push({
          id: chat.id,
          name: name,
          keywords: `${name} chat`,
          section: 'Chats',
          parent: 'chat',
          perform: () => chatStore.selectChat(chat),
        })
      })

      setChatOptions(nextChatActions)
    })
  }, [])

  useRegisterActions(chatOptions, [chatOptions])
}

const useRegisterMessageActions = () => {
  const { searchQuery, options } = useKBar(state => ({
    searchQuery: state.searchQuery,
  }))

  const [messageActions, setMessageActions] = useState<Action[]>([])

  const getRootMessageIds = async (text: string) => {
    const messageIds: string[] = []
    const rootIdBySelectedId: Record<string, string> = {}

    await messageTable.iterate(message => {
      // map selected variation to its parent
      if (message.selectedVariationId) {
        rootIdBySelectedId[message.selectedVariationId] = message.id
      }

      // keep track of message that had the content
      if (message.content.toLowerCase().includes(text)) {
        messageIds.push(message.id)
      }
    })

    const rootMessageIds = new Set(
      messageIds.map(messageId => rootIdBySelectedId[messageId] || messageId),
    )

    return rootMessageIds
  }

  const searchMessages = async (text: string) => {
    if (text.length < 3) return

    const rootMessageIds = await getRootMessageIds(text)

    const countMessagesWithText = (messageIds: string[]) => {
      // if any of the lowercased messages contain the text
      return _.sumBy(messageIds, messageId => {
        return rootMessageIds.has(messageId) ? 1 : 0
      })
    }

    const nextMessageActions: Action[] = []

    chatStore.chats.forEach(chat => {
      const messageCount = countMessagesWithText(chat.source.messageIds)

      if (messageCount > 0) {
        nextMessageActions.push(
          createAction({
            name: chat.name,
            // important, text is used to keyword to make sure item displays in list
            keywords: text,
            section: 'Chats by Message',
            subtitle: messageCount === 1 ? '1 message' : `${messageCount} messages`,
            perform: () => chatStore.selectChat(chat),
          }),
        )
      }
    })

    if (_.isEmpty(nextMessageActions)) {
      nextMessageActions.push(
        createAction({
          name: '',
          subtitle: 'No Chats found',
          keywords: `z ${text}`,
          priority: Priority.LOW,
          perform: () => null,
        }),
      )
    }

    setMessageActions(nextMessageActions)
  }

  useEffect(() => {
    // dynamically lookup messages
    options.callbacks = {
      onQueryChange: _.throttle(searchQuery => {
        searchMessages(searchQuery.toLowerCase())
      }, 500),
    }
  }, [])

  useEffect(() => {
    if (searchQuery.length < 3) {
      setMessageActions([])
    }
  }, [searchQuery])

  useRegisterActions(messageActions, [messageActions])
}

const useDeleteActions = () => {
  const [deleteActions, setDeleteActions] = useState<Action[]>([])

  useEffect(() => {
    autorun(() => {
      const actions: Action[] = []

      actions.push({
        id: 'delete',
        name: 'Delete data',
        keywords: 'delete ',
        section: 'Actions',
      })

      chatStore.chats.forEach(chat => {
        actions.push(
          createAction({
            name: 'Delete ' + chat.name,
            keywords: 'delete chat ' + chat.name,
            section: 'Chat',
            parent: 'delete',
            perform: () => chatStore.destroyChat(chat),
          }),
        )
      })

      personaStore.personas.forEach(persona =>
        actions.push(
          createAction({
            name: 'Delete ' + persona.name,
            keywords: 'system prompt persona delete ' + persona.name,
            section: 'Persona',
            parent: 'delete',
            perform: () => personaStore.destroyPersona(persona),
          }),
        ),
      )

      connectionStore.connections.forEach(connection => {
        actions.push(
          createAction({
            name: 'Delete ' + connection.label,
            keywords: 'connection server delete ' + connection.label,
            section: 'Connection',
            parent: 'delete',
            perform: () => connectionStore.deleteConnection(connection),
          }),
        )
      })

      actions.push(
        createAction({
          name: 'Delete ALL Chats',
          keywords: 'delete all chats reset',
          section: 'Batch',
          parent: 'delete',
          priority: Priority.HIGH,
          perform: () => chatStore.destroyAllChats(),
        }),
      )

      actions.push(
        createAction({
          name: 'Delete ALL Personas',
          keywords: 'delete all personas reset',
          section: 'Batch',
          parent: 'delete',
          priority: Priority.HIGH,
          perform: () => personaStore.destroyAllPersonas(),
        }),
      )

      actions.push(
        createAction({
          name: 'Delete ALL Connections',
          keywords: 'delete all connection reset',
          section: 'Batch',
          parent: 'delete',
          priority: Priority.HIGH,
          perform: () => connectionStore.destroyAllConnections(),
        }),
      )

      actions.push(
        createAction({
          name: 'Delete/Reset/Wipe App',
          keywords: 'delete all app wipe reset',
          section: 'Batch',
          parent: 'delete',
          priority: Priority.LOW,
          perform: async () => {
            // this goes through all the caches as well
            await chatStore.destroyAllChats()

            localForage.dropInstance({ name: 'llm-x' })
            window.location.reload()
          },
        }),
      )

      setDeleteActions(actions)
    })
  }, [])

  useRegisterActions(deleteActions, [deleteActions])
}

const OmniBar = () => {
  const navigate = useNavigate()

  useRegisterThemeActions()
  useRegisterModelActions()
  useRegisterPersonaActions()
  useRegisterChatActions()
  useRegisterMessageActions()
  useDeleteActions()

  useRegisterActions([
    createAction({
      name: 'New chat',
      keywords: 'empty goto go to new chat create',
      section: 'Actions',
      shortcut: ['$mod+Shift+O'],
      perform: () => chatStore.createChat(),
    }),

    createAction({
      name: 'Toggle Sidebar',
      keywords: 'toggle side bar sidebar',
      section: 'Actions',
      shortcut: ['$mod+m'],
      perform: () => settingStore.toggleSideBar(),
    }),
  ])

  useEffect(() => {
    // manually handle keybindings since kbar has some kind of bug around re-opening
    return tinykeys(window, {
      '$mod+k': (event: Event) => {
        event.preventDefault()

        navigate('/search')
      },
      '$mod+/': () => {
        navigate('/initial')
      },
    })
  }, [])

  return null
}

export default OmniBar
