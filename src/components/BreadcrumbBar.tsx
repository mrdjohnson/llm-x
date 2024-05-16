import { observer } from 'mobx-react-lite'
import { Breadcrumbs, BreadcrumbItem } from '@nextui-org/react'
import _ from 'lodash'

type BreadcrumbType = {
  isSelected: boolean
  label: string
  onClick: () => void
}

const BreadcrumbBar = observer(
  ({ breadcrumbs }: { breadcrumbs: Array<BreadcrumbType | undefined> }) => {
    return (
      <Breadcrumbs className="mb-2">
        {_.compact(breadcrumbs).map(breadcrumb => (
          <BreadcrumbItem
            className={
              breadcrumb.isSelected
                ? ' [&>*]:!text-primary'
                : 'scale-90 [&>*]:!text-base-content/70'
            }
            isCurrent={breadcrumb.isSelected}
            onPress={breadcrumb.onClick}
            key={breadcrumb.label}
          >
            {breadcrumb.label}
          </BreadcrumbItem>
        ))}
      </Breadcrumbs>
    )
  },
)

export default BreadcrumbBar
