import { ComboboxItem, ComboboxItemGroup, Select } from '@mantine/core'

import { connectionStore } from '~/core/connection/ConnectionStore'
import { actorStore } from '~/core/actor/ActorStore'
import { BaseLanguageModel } from '~/core/connection/types'

type ModelAutoCompleteProps = {
  onModelSelected: (connectionId?: string, modelId?: string) => void
  selectedModelId?: string
}

type ModelComboboxItem = ComboboxItem & {
  model?: BaseLanguageModel
  connectionId?: string
}

const ModelAutoComplete = ({ onModelSelected, selectedModelId }: ModelAutoCompleteProps) => {
  const systemActor = actorStore.systemActor

  const isDefaultSelected = !selectedModelId

  const options: Array<ModelComboboxItem | ComboboxItemGroup<ModelComboboxItem>> =
    connectionStore.activeConnections.map(connection => {
      return {
        group: connection.label,
        items: connection.models.map(model => ({
          value: model.id,
          label: model.label,
          model,
          connectionId: connection.id,
        })),
      }
    })

  // model stays null to keep as the default model
  options.unshift({
    value: systemActor.id,
    label: systemActor.modelLabel || 'Default model',
  })

  return (
    <Select
      searchable
      data={options}
      value={selectedModelId || null}
      onChange={(_value, option) => {
        const modelOption = option as ModelComboboxItem | null | undefined

        onModelSelected(modelOption?.connectionId, modelOption?.model?.id)
      }}
      clearable
      allowDeselect={false}
      placeholder={isDefaultSelected ? actorStore.systemActor?.modelLabel : undefined}
    />
  )
}

export default ModelAutoComplete
