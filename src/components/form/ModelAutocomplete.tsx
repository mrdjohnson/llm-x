import { Autocomplete, AutocompleteItem, AutocompleteSection } from '@nextui-org/react'
import { observer } from 'mobx-react-lite'

import { connectionStore } from '~/core/connection/ConnectionStore'

type ModelAutoCompleteProps = {
  onModelSelected: (connectionId: string, modelId: string) => void
  selectedModelId?: string
}

const ModelAutoComplete = observer(({ onModelSelected, selectedModelId }: ModelAutoCompleteProps) => {
  return (
    <Autocomplete
      allowsCustomValue
      classNames={{
        popoverContent: 'text-base-content bg-base-100 rounded-md',
        listbox: 'text-base-content',
      }}
      inputProps={{
        classNames: {
          label: '!text-base-content/45',
          inputWrapper:
            '!bg-transparent border rounded-md border-base-content/30 !text-base-content [&_button]:text-base-content/60',
          input: '!text-base-content',
        },
      }}
      label="Select a Model"
      scrollShadowProps={{
        isEnabled: false,
      }}
      selectedKey={selectedModelId}
      description="The model will not display if it cannot be found on load"
    >
      {connectionStore.activeConnections.map(connection => (
        <AutocompleteSection
          title={connection.label}
          classNames={{
            heading:
              'flex w-full sticky top-0 z-20 py-1.5 px-2 bg-base-100 border-b border-base-content/30',
          }}
          showDivider
        >
          {connection.models.map(model => (
            <AutocompleteItem
              key={model.id}
              textValue={model.modelName}
              onClick={() => onModelSelected(connection.id, model.id)}
            >
              {model.modelName}
            </AutocompleteItem>
          ))}
        </AutocompleteSection>
      ))}
    </Autocomplete>
  )
})

export default ModelAutoComplete
