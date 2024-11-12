import { ReactNode } from 'react'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'

import { NavButtonDiv } from '~/components/NavButton'

export type BaseListItemType<T> = {
  id: string
  label: string
  data: T

  subLabels?: string | string[]
}

type BaseListItemProps<T> = {
  item: BaseListItemType<T>

  renderActionRow?: (data: T, index?: number) => ReactNode
  onClick?: (data?: BaseListItemType<T>, index?: number) => void

  isSmall?: boolean
  isSelectedItem?: boolean
  isDisplayItem?: boolean
  index?: number
}

const BaseListItem = observer(
  <T,>({
    item,
    isSmall,
    renderActionRow,
    onClick,
    isSelectedItem,
    index,
  }: BaseListItemProps<T>) => {
    return (
      <NavButtonDiv
        key={item.id}
        to={item.id}
        onClick={() => onClick?.(item, index)}
        className={
          ' rounded-md bg-base-200 p-1 first-of-type:mt-0 ' +
          (isSelectedItem ? ' text-primary' : '')
        }
      >
        {isSmall ? (
          <span className="max-w-[20ch] justify-center">{item.label}</span>
        ) : (
          <div className="flex flex-row items-center gap-0 rounded-md px-2 *:text-left">
            <div className="my-auto flex w-full flex-col self-start text-left">
              <span className={'mr-3 ' + (isSelectedItem ? ' text-primary' : '')}>
                {item.label}
              </span>

              {_.toArray(item.subLabels).map((subLabel, index) => (
                <p className="line-clamp-2 self-start text-sm text-base-content/45" key={index}>
                  {subLabel}
                </p>
              ))}
            </div>

            {renderActionRow && (
              <div
                className="isolate ml-auto flex h-full flex-row flex-nowrap items-center pl-4"
                onClick={e => e.preventDefault()}
              >
                {renderActionRow?.(item.data, index)}
              </div>
            )}
          </div>
        )}
      </NavButtonDiv>
    )
  },
)

export default BaseListItem
