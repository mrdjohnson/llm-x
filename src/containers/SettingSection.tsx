import { useMemo, useState, ReactNode, MouseEventHandler, type MouseEvent } from 'react'
import { ScrollShadow } from '@heroui/react'
import _ from 'lodash'
import { twMerge } from 'tailwind-merge'

import FormInput from '~/components/form/FormInput'
import ListItem from '~/components/listItem/BaseListItem'
import { NavButton } from '~/components/NavButton'

export type SettingSectionItem<T> = {
  id: string
  to?: string
  label: string
  subLabels?: string | string[]
  data: T
}

export type SettingSectionProps<T> = {
  filterProps?: {
    helpText: string
    itemFilter?: (item: T, filterText: string) => void
    emptyLabel?: string
  }
  addButtonProps?: {
    label: string
    onClick?: MouseEventHandler<HTMLButtonElement>
    isDisabled?: boolean
  }
  items: Array<SettingSectionItem<T>>
  renderActionRow?: (data: T, index?: number) => ReactNode
  onItemSelected?: (data?: T, index?: number) => void
  selectedItemId?: string
  isSubSection?: boolean
  skipSelectedItem?: boolean
  hasLargeItems?: boolean
}

const SettingSection = <T,>({
  filterProps,
  addButtonProps,
  items,
  selectedItemId,
  renderActionRow,
  onItemSelected,
  isSubSection = false,
  hasLargeItems = false,
}: SettingSectionProps<T>) => {
  const [filterText, setFilterText] = useState('')

  const filteredItems = useMemo(() => {
    const itemFilter = filterProps?.itemFilter

    if (!itemFilter) return items

    const lowerCaseFilter = filterText.toLowerCase()

    return items.filter(({ data }) => itemFilter(data, lowerCaseFilter))
  }, [items, filterText])

  const handleItemSelected = (
    item?: SettingSectionItem<T>,
    index?: number,
    e?: MouseEvent<HTMLDivElement>,
  ) => {
    if (onItemSelected && !e?.isDefaultPrevented()) {
      onItemSelected(item?.data, index)

      e?.preventDefault()
    }
  }

  const handleAddButtonClicked: MouseEventHandler<HTMLButtonElement> = e => {
    addButtonProps!.onClick?.(e)
  }

  const handleFilterChanged = (text: string) => {
    handleItemSelected(undefined)
    setFilterText(text)
  }

  return (
    <div
      className={twMerge(
        'flex h-full max-h-full w-full flex-col rounded-md px-2',
        isSubSection && 'bg-base-300',
      )}
    >
      {!_.isEmpty(items) && (
        <div className="flex w-full flex-row gap-2 py-2 align-middle">
          {filterProps && (
            <FormInput
              variant="underlined"
              placeholder={filterProps.helpText}
              value={filterText}
              onChange={e => handleFilterChanged(e.target.value)}
            />
          )}
        </div>
      )}

      <div className="flex flex-1 flex-row gap-2 overflow-hidden">
        <ScrollShadow className="flex max-h-full w-full flex-shrink-0">
          <ul className="menu !flex w-full flex-col flex-nowrap gap-2 rounded-md p-0">
            {filteredItems.map((item, index) => (
              <ListItem
                item={item}
                key={item.id}
                index={index}
                isSelectedItem={item.id === selectedItemId}
                onClick={handleItemSelected}
                renderActionRow={renderActionRow}
                isLarge={hasLargeItems}
              />
            ))}

            {_.isEmpty(filteredItems) && filterProps?.emptyLabel && (
              <span className="pt-6 text-center font-semibold text-base-content/30">
                {filterProps.emptyLabel}
              </span>
            )}

            {addButtonProps && (
              <li className="mt-auto w-full pt-2">
                <NavButton
                  to="empty_panel"
                  className={twMerge(
                    'btn btn-primary btn-sm mx-auto mb-1 w-fit',
                    addButtonProps.isDisabled && 'btn-neutral pointer-events-none opacity-35',
                  )}
                  disabled={addButtonProps.isDisabled}
                  onClick={handleAddButtonClicked}
                >
                  {addButtonProps.label}
                </NavButton>
              </li>
            )}
          </ul>
        </ScrollShadow>
      </div>
    </div>
  )
}

export default SettingSection
