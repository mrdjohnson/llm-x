import { useNavigate } from 'react-router-dom'
import _ from 'lodash'
import { Anchor, Breadcrumbs } from '@mantine/core'

export type BreadcrumbType = {
  label: string
  path: string
}

type BreadcrumbBarProps = {
  breadcrumbs: BreadcrumbType[]
}

// Gets a list of crumbs and paths and determines the selected one (might be overkill and maybe I should just use the last index)
const BreadcrumbBar = ({ breadcrumbs }: BreadcrumbBarProps) => {
  const navigate = useNavigate()

  return (
    <Breadcrumbs className="mt-2 place-self-center rounded-lg bg-black/10 p-2">
      {breadcrumbs.map((breadcrumb, index) => (
        <Anchor
          className="underline-offset-2"
          underline={index === breadcrumbs.length - 1 ? 'never' : 'always'}
          key={breadcrumb.label}
          onClick={() => navigate(breadcrumb.path)}
        >
          {breadcrumb.label}
        </Anchor>
      ))}
    </Breadcrumbs>
  )
}

export default BreadcrumbBar
