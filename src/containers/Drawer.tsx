import _ from 'lodash'
import React, {
  createContext,
  MouseEventHandler,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { twMerge } from 'tailwind-merge'

import BreadcrumbBar, { type BreadcrumbType } from '~/components/BreadcrumbBar'

type DrawerContext = {
  crumbs: BreadcrumbType[]
  addCrumb: (crumb: BreadcrumbType) => void
  removeCrumb: (crumb: BreadcrumbType) => void | undefined
}

const DrawerContext = createContext<DrawerContext>({
  crumbs: [],
  addCrumb: _.noop,
  removeCrumb: _.noop,
})

type CloseDrawerButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export const CloseDrawerOverlay = ({ onClick, ...props }: CloseDrawerButtonProps) => {
  const navigate = useNavigate()

  const handleClick: MouseEventHandler<HTMLButtonElement> = event => {
    event.preventDefault()
    event.stopPropagation()

    onClick?.(event)

    // go up one level
    navigate('')
  }

  return <button {...props} onClick={handleClick} type="button" />
}

type DrawerProps = PropsWithChildren<{
  path?: string
  label: string

  outletContent?: Record<string, unknown>
}>

export const Drawer = ({ path, label, children, outletContent = { crumbs: [] } }: DrawerProps) => {
  const { crumbs: drawerCrumbs } = useContext(DrawerContext)

  const { pathname } = useLocation()

  const currentCrumb = { label, path: path || pathname }
  const [stateCrumbs, setStateCrumbs] = useState(drawerCrumbs.concat(currentCrumb))
  const depth = useRef(drawerCrumbs.length)

  const lastPath = _.last(stateCrumbs)?.path
  const notTopSlide = pathname !== lastPath
  const hasChild = !pathname.endsWith(lastPath || '') && depth.current !== 0

  useEffect(() => {
    if (depth.current === 0) {
      setStateCrumbs([{ label, path: path! }])
    } else {
      const nextCrumbs = [...stateCrumbs]
      nextCrumbs[depth.current] = currentCrumb

      setStateCrumbs(nextCrumbs)
    }
  }, [label, path])

  return (
    <DrawerContext.Provider
      value={{
        crumbs: stateCrumbs,
        addCrumb: crumb => setStateCrumbs(crumbs => [...crumbs, crumb]),
        removeCrumb: crumb => setStateCrumbs(crumbs => _.without(crumbs, crumb)),
      }}
    >
      <div className="drawer drawer-end h-full max-h-full overflow-scroll rounded-md">
        <div className="drawer-content col-span-full flex h-full max-h-full flex-col overflow-hidden">
          <div
            className={twMerge(
              'flex h-full max-h-full w-full flex-1 flex-col rounded-md',
              hasChild && 'border-l-1 border-l-white',
              notTopSlide && 'blur-[1px]',
            )}
          >
            {depth.current > 0 && <BreadcrumbBar breadcrumbs={stateCrumbs} />}

            {children}
          </div>
        </div>

        <input type="checkbox" className="drawer-toggle" checked={notTopSlide} readOnly />

        <div className="drawer-side relative col-span-full col-start-1 h-full max-h-full overflow-hidden rounded-md ">
          <CloseDrawerOverlay className="drawer-overlay z-20 rounded-md" />

          <div
            className="relative z-20 flex h-full max-h-full min-h-full w-full flex-col overflow-hidden rounded-md bg-base-200 text-base-content lg:w-11/12"
            data-id={label}
          >
            <Outlet context={outletContent} />
          </div>
        </div>
      </div>
    </DrawerContext.Provider>
  )
}

export default Drawer
