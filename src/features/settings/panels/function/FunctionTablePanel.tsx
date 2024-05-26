import { observer } from 'mobx-react-lite'

import { ICustomFunctionModel, customFunctionStore } from '~/models/CustomFunctionStore'

import SelectionPanelTable, {
  SortType as SelectionPanelSortType,
} from '~/components/SelectionTablePanel'

import Edit from '~/icons/Edit'

const customFunctionSortTypes: Array<SelectionPanelSortType<ICustomFunctionModel>> = [
  { label: 'Name', value: 'name' },
  { label: 'Enabled', value: 'enabled' },
  { label: 'Description', value: 'description' },
]

const FunctionTablePanel = observer(({ onShowDetails }: { onShowDetails: () => void }) => {
  const { customFunctions, selectedCustomFunction } = customFunctionStore

  const handleCustomFunctionSelected = (customFunction: ICustomFunctionModel) => {
    customFunctionStore.setSelectedCustomFunction(customFunction)
  }

  const createCustomFunction = async () => {
    const customFunction = customFunctionStore.createCustomFunction({
      description: 'A sample function',
      parameters: {
        newParam: {
          description: 'A sample parameter',
          type: 'string',
          required: false,
        },
      },
    })

    customFunctionStore.setSelectedCustomFunction(customFunction)
  }

  const renderRow = (customFunction: ICustomFunctionModel) => (
    <>
      <td className="align-top">{customFunction.name}</td>

      <td className="align-top">
        <div className="flex flex-col gap-2">
          <input
            type="checkbox"
            defaultChecked={customFunction.enabled}
            className="checkbox checkbox-xs tooltip tooltip-bottom"
            onClick={e => e.preventDefault()}
          />
          <p />
        </div>
      </td>

      <td className="max-w-80 align-top">
        <div className="flex flex-col gap-2">
          <p className=" line-clamp-2 whitespace-pre-wrap">{customFunction.description}</p>

          <div className="flex h-full w-full justify-end">
            <button
              className="group btn btn-square btn-ghost btn-xs opacity-30 transition-opacity duration-200 ease-in-out hover:scale-125 hover:opacity-100 "
              onClick={onShowDetails}
            >
              <Edit />
            </button>
          </div>
        </div>
      </td>
    </>
  )

  return (
    <>
      <SelectionPanelTable
        items={customFunctions}
        sortTypes={customFunctionSortTypes}
        primarySortTypeLabel="name"
        itemFilter={(customFunction: ICustomFunctionModel, filterText: string) =>
          [customFunction.name.toLowerCase(), customFunction.description.toLowerCase()].includes(
            filterText.toLowerCase(),
          )
        }
        renderRow={renderRow}
        getItemKey={customFunction => customFunction.id}
        onItemSelected={handleCustomFunctionSelected}
        getIsItemSelected={customFunction => customFunction === selectedCustomFunction}
        filterInputPlaceholder="Filter by name or description..."
      />

      <div className="mt-auto" />
      <div className="mt-4 flex justify-end gap-4">
        <button
          className="btn btn-neutral btn-sm flex w-fit flex-row gap-2 text-error"
          onClick={() => customFunctionStore.setSelectedCustomFunction(undefined)}
          disabled={!selectedCustomFunction}
        >
          Clear Selection
        </button>

        <button
          className="btn btn-neutral btn-sm flex w-fit flex-row gap-2"
          onClick={createCustomFunction}
          disabled={customFunctionStore.hasUnnamedCustomFunction}
        >
          Add New Function
        </button>
      </div>
    </>
  )
})

export default FunctionTablePanel
