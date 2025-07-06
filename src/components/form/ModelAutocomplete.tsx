import { Autocomplete, AutocompleteItem, AutocompleteSection } from '@heroui/react'

import Check from '~/icons/Check'
import Delete from '~/icons/Delete'

import { connectionStore } from '~/core/connection/ConnectionStore'
import { actorStore } from '~/core/actor/ActorStore'

type ModelAutoCompleteProps = {
  onModelSelected: (connectionId?: string, modelId?: string) => void
  selectedModelId?: string
}

const ModelAutoComplete = ({ onModelSelected, selectedModelId }: ModelAutoCompleteProps) => {
  const dynamicModelOptions = []

  const model = selectedModelId
    ? connectionStore.getModelById(selectedModelId)
    : actorStore.systemActor.model

  const isDefaultSelected = !selectedModelId

  const modelLabel = model?.label + (isDefaultSelected ? ' (default)' : '')

  if (model) {
    dynamicModelOptions.push(
      <AutocompleteItem
        key="system"
        textValue="System current model"
        className="my-1 line-clamp-1 p-4 text-lg text-base-content/60 md:p-2 md:!text-lg"
        classNames={{
          title: 'text-lg md:text-sm line-clamp-1',
        }}
        startContent={<Check />}
        endContent={
          !isDefaultSelected && (
            <button
              className="place-content-center pl-2 text-error opacity-30 hover:!opacity-100"
              onClick={() => onModelSelected()}
              title="Remove model from actor"
            >
              <Delete className="h-6 w-6 md:w-4" />
            </button>
          )
        }
      >
        {modelLabel}
      </AutocompleteItem>,
    )
  }

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
      selectedKey={selectedModelId || null}
      description="The model will not display if it cannot be found on load"
      clearButtonProps={{ onClick: () => onModelSelected() }}
      placeholder={isDefaultSelected ? modelLabel : undefined}
    >
      {[
        ...dynamicModelOptions,

        ...connectionStore.activeConnections.map(connection => (
          <AutocompleteSection
            key={connection.id}
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
        )),
      ]}
    </Autocomplete>
  )
}

export default ModelAutoComplete
