import { useMemo } from 'react'
import _ from 'lodash'
import { ScrollShadow } from "@heroui/react"
import { observer } from 'mobx-react-lite'
import { useParams } from 'react-router-dom'
import Markdown from 'react-markdown'

import CopyButton from '~/components/CopyButton'
import SettingSection, { SettingSectionItem } from '~/containers/SettingSection'
import Drawer from '~/containers/Drawer'

import { connectionModelLabelByType, connectionViewModelByType } from '~/core/connection/viewModels'
import { ConnectionModel } from '~/core/connection/ConnectionModel'
import { ConnectionTypes } from '~/core/connection/types'

import { LmsHelpMarkdown } from '~/features/settings/panels/help/LmsHelpMarkdown'
import { OllamaHelpMarkdown } from '~/features/settings/panels/help/OllamaHelpMarkdown'
import { A1111HelpMarkdown } from '~/features/settings/panels/help/A1111HelpMarkdown'
import { GeminiHelpMarkdown } from '~/features/settings/panels/help/GeminiHelpPanel'
import { OpenAiHelpMarkdown } from '~/features/settings/panels/help/OpenAiHelpPanelMarkdown'

const CodeBlock = (props: React.HTMLAttributes<HTMLElement>) => {
  const { children } = props

  const code = useMemo(() => {
    return _.toString(children)
  }, [children])

  return (
    <span className="my-4 inline-flex w-fit flex-row flex-wrap gap-2">
      <CopyButton className="btn swap btn-sm" text={code} />

      <span className="prose">
        <code>{code}</code>
      </span>
    </span>
  )
}

export const ConnectionHelpPanel = observer(() => {
  const { id } = useParams<{ id: ConnectionTypes }>()

  const markdown = useMemo(() => {
    if (id === 'LMS') return LmsHelpMarkdown
    if (id === 'Ollama') return OllamaHelpMarkdown
    if (id === 'A1111') return A1111HelpMarkdown
    if (id === 'Gemini') return GeminiHelpMarkdown
    if (id === 'OpenAi') return OpenAiHelpMarkdown
  }, [id])

  return (
    <Drawer label={connectionModelLabelByType[id!]}>
      <div className="flex-1 overflow-y-hidden px-2 pt-2">
        <ScrollShadow className="h-full max-h-full pb-7">
          {__TARGET__ === 'chrome' && (
            <>
              <h3 className="text-wrap pb-3 text-lg font-bold">
                NOTE: Connections should be automatic!
              </h3>

              <p>
                This chrome extension automatically detects your local network and connects to
                Ollama, LM Studio, and Automatic1111 for you without needing any special
                configurations! (special thanks to page-assist and ollama-ui)
              </p>

              <div className="divider" />
            </>
          )}

          <Markdown
            className="prose-spacing prose flex w-full flex-wrap text-wrap break-words pl-2 prose-p:w-full"
            components={{
              h3: props => <h3 className="-ml-2 [&>*]:text-lg [&>*]:font-bold" {...props} />,
              a: props => <a target="__blank" className="link mx-0 !text-primary " {...props} />,
              code: CodeBlock,
            }}
          >
            {markdown}
          </Markdown>

          {/* TODO: add a list of connection cards (based on selected type) at the bottom here for easy transitions back for the user */}
        </ScrollShadow>
      </div>
    </Drawer>
  )
})

const HelpPanel = observer(() => {
  const helpItems = _.values(connectionViewModelByType).map(connection =>
    connection().getSnapshot(),
  )

  const connectionToSectionItem = (
    connection: ConnectionModel,
  ): SettingSectionItem<ConnectionModel> => ({
    id: connection.type,
    label: connectionModelLabelByType[connection.type],
    data: connection,
  })

  const itemFilter = (connection: ConnectionModel, filterText: string) => {
    return connection.label.toLowerCase().includes(filterText)
  }

  return (
    <SettingSection
      items={helpItems.map(connectionToSectionItem)}
      filterProps={{
        helpText: 'Filter connections by label...',
        itemFilter,
        emptyLabel: 'No connections found',
      }}
      hasLargeItems
    />
  )
})

export default HelpPanel
