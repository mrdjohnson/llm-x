import { observer } from 'mobx-react-lite'
import { useMemo, useState, ReactNode, useEffect } from 'react'
import { Input, ScrollShadow } from '@nextui-org/react'
import _ from 'lodash'

import Back from '~/icons/Back'

export type SettingSectionItem<T> = {
  id: string
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
  addButtonProps: {
    label: string
    onClick?: () => void
  }
  items: Array<SettingSectionItem<T>>
  renderItemSection: (data: T) => ReactNode
  emptySectionPanel?: ReactNode
  renderActionRow?: (data: T) => ReactNode
  onItemSelected?: (data?: T) => void
  selectedItem?: SettingSectionItem<T>
  allowSmallItems?: boolean
}

const SettingSection = observer(
  <T,>({
    filterProps,
    addButtonProps,
    items,
    selectedItem,
    emptySectionPanel,
    renderItemSection,
    renderActionRow,
    onItemSelected,
    allowSmallItems = true,
  }: SettingSectionProps<T>) => {
    const [filterText, setFilterText] = useState('')
    const [displayItem, setDisplayItem] = useState(selectedItem)

    const filteredItems = useMemo(() => {
      const itemFilter = filterProps?.itemFilter

      if (!itemFilter) return items

      const lowerCaseFilter = filterText.toLowerCase()

      return items.filter(({ data }) => itemFilter(data, lowerCaseFilter))
    }, [items, filterText])

    const handleItemSelected = (item?: SettingSectionItem<T>) => {
      onItemSelected?.(item?.data)
      setDisplayItem(item)
    }

    const handleAddButtonClicked = () => {
      setDisplayItem(undefined)
      addButtonProps.onClick?.()
    }

    useEffect(() => {
      setDisplayItem(selectedItem)
    }, [selectedItem])

    const hasSidePanel = displayItem || emptySectionPanel
    const isSmallSection = allowSmallItems && hasSidePanel

    return (
      <div className="flex h-full max-h-full w-full flex-col rounded-md">
        <div className="flex w-full flex-row gap-2 py-2 pb-4 align-middle">
          {displayItem && (
            <button type="button" onClick={() => handleItemSelected(undefined)}>
              <Back />
            </button>
          )}

          {filterProps && (
            <Input
              type="text"
              variant="underlined"
              value={filterText}
              placeholder={filterProps.helpText}
              classNames={{
                input: '!text-base-content',
                innerWrapper: 'pb-0',
                inputWrapper: '!bg-base-transparent border-base-content/30',
              }}
              onChange={e => setFilterText(e.target.value)}
            />
          )}
        </div>

        <div className={'flex flex-1 flex-row gap-2 overflow-hidden'}>
          <ScrollShadow
            className={'flex max-h-full flex-shrink-0 ' + (hasSidePanel ? ' w-fit' : ' w-full')}
          >
            <ul
              className={
                'menu !flex flex-col flex-nowrap rounded-box p-0 pt-1 ' +
                (isSmallSection ? 'w-fit' : 'w-full')
              }
            >
              {filteredItems.map(item => (
                <li
                  key={item.id}
                  onClick={() => handleItemSelected(item)}
                  className={
                    ' rounded-md bg-base-300 ' +
                    (item.id === selectedItem?.id ? ' text-primary/50' : '') +
                    (item.id === displayItem?.id ? ' !bg-base-content/10 !text-primary/80' : '')
                  }
                >
                  {isSmallSection ? (
                    <span className="max-w-[20ch] justify-center">{item.label}</span>
                  ) : (
                    <div className="flex flex-row gap-0 px-2 *:text-left">
                      <div className="flex w-full flex-col self-start text-left">
                        <span
                          className={
                            'mr-3 ' +
                            (item.id === selectedItem?.id ? ' text-primary/50' : '') +
                            (item.id === displayItem?.id ? ' !text-primary/80' : '')
                          }
                        >
                          {item.label}
                        </span>

                        {_.toArray(item.subLabels).map(subLabel => (
                          <p className="line-clamp-2 self-start text-sm text-base-content/45">
                            {subLabel}
                          </p>
                        ))}
                      </div>

                      <div className="ml-auto flex h-full flex-row flex-nowrap items-center pl-4">
                        {renderActionRow?.(item.data)}
                      </div>
                    </div>
                  )}
                </li>
              ))}

              {!filteredItems[0] && filterProps?.emptyLabel && (
                <span className="pt-6 text-center font-semibold text-base-content/30">
                  {filterProps.emptyLabel}
                </span>
              )}

              <li className="mt-auto pt-4">
                <button
                  type="button"
                  className="btn btn-primary btn-sm mb-1 max-w-[20ch]"
                  onClick={handleAddButtonClicked}
                >
                  {addButtonProps.label}
                </button>
              </li>
            </ul>
          </ScrollShadow>

          {displayItem ? renderItemSection(displayItem.data) : emptySectionPanel}
        </div>
      </div>
    )
  },
)

export default SettingSection
