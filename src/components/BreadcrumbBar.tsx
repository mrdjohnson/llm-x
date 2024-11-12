import { useNavigate } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { Breadcrumbs, BreadcrumbItem } from '@nextui-org/react'
import _ from 'lodash'

export type BreadcrumbType = {
  label: string
  path: string
}

type BreadcrumbBarProps = {
  breadcrumbs: BreadcrumbType[]
}

// Gets a list of crumbs and paths and determines the selected one (might be overkill and maybe I should just use the last index)
const BreadcrumbBar = observer(({ breadcrumbs }: BreadcrumbBarProps) => {
  const navigate = useNavigate()

  return (
    <Breadcrumbs className="mt-2 place-self-center rounded-lg bg-base-content/10 p-2">
      {breadcrumbs.map((breadcrumb, index) => (
        <BreadcrumbItem
          className={
            index === breadcrumbs.length - 1
              ? ' [&>*]:!text-primary'
              : 'underline decoration-base-content/70 [&>*]:!text-base-content/70'
          }
          isCurrent={index === breadcrumbs.length - 1}
          key={breadcrumb.label}
          onClick={() => navigate(breadcrumb.path)}
        >
          {breadcrumb.label}
        </BreadcrumbItem>
      ))}
    </Breadcrumbs>
  )
})

export default BreadcrumbBar
