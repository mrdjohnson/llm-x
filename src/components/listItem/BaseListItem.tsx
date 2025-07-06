import { ReactNode, type MouseEvent } from 'react'
import _ from 'lodash'
import { twMerge } from 'tailwind-merge'

import { NavButtonDiv } from '~/components/NavButton'

export type BaseListItemType<T> = {
  id: string
  to?: string
  label: string
  data: T

  subLabels?: string | string[]
}

type BaseListItemProps<T> = {
  item: BaseListItemType<T>

  renderActionRow?: (data: T, index?: number) => ReactNode
  onClick?: (data?: BaseListItemType<T>, index?: number, e?: MouseEvent<HTMLDivElement>) => void

  isLarge?: boolean
  isSelectedItem?: boolean
  isDisplayItem?: boolean
  index?: number
}

const BaseListItem = <T,>({
  item,
  isLarge,
  renderActionRow,
  onClick,
  isSelectedItem,
  index,
}: BaseListItemProps<T>) => {
  return (
    <NavButtonDiv
      key={item.id}
      to={item.to || item.id}
      onClick={e => onClick?.(item, index, e)}
      className={twMerge(
        'rounded-md bg-base-200 p-1 first-of-type:mt-0',
        isSelectedItem && 'text-primary',
      )}
    >
      <div
        className={twMerge(
          'group flex flex-row items-center gap-0 rounded-md px-2 *:text-left',
          isLarge && 'p-2',
        )}
      >
        <div className="my-auto flex w-full flex-col self-start text-left">
          <span
            className={twMerge(
              'mr-3 underline decoration-transparent underline-offset-4 transition-all duration-100 ease-in group-hover:decoration-current',
              isSelectedItem && 'text-primary',
              isLarge && 'text-large',
            )}
          >
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
    </NavButtonDiv>
  )
}

export default BaseListItem
