import { useRef, useState, useEffect, KeyboardEventHandler, useMemo } from 'react'
import { Input } from '@heroui/react'
import { ActionImpl, useKBar, VisualState } from 'kbar'
import { useLocation, useNavigate } from 'react-router'
import { twMerge } from 'tailwind-merge'

const SettingSearchBar = () => {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const { query, actions, currentActionId, isAnimatingOut } = useKBar(state => {
    return {
      actions: state.actions,
      currentActionId: state.currentRootActionId,
      isAnimatingOut: state.visualState === VisualState.animatingOut,
    }
  })

  const currentAction = useMemo(() => {
    const action = currentActionId && actions[currentActionId]

    if (action instanceof ActionImpl) {
      return action
    }

    return null
  }, [actions, currentActionId])

  const searchRef = useRef<HTMLInputElement>(null)
  const [searchText, setSearchText] = useState('')

  const isSearching = pathname === '/search'

  // manually focus so the input does not grab focus unexpectedly
  // yes, this should happen every change/render
  useEffect(() => {
    if (pathname === '/search') {
      searchRef.current?.focus()
    }
  })

  useEffect(() => {
    query.setSearch(searchText)
  }, [searchText])

  useEffect(() => {
    // if we stopped searching, reset the current action tree
    if (!isSearching) {
      query.setCurrentRootAction(null)
      query.setVisualState(VisualState.hidden)
      return
    }

    // if we click on an option that closes kbar, we should quit
    if (isAnimatingOut) {
      navigate('/')
    } else {
      // let kbar know we opened it manually 
      query.setVisualState(VisualState.showing)
    }
  }, [isAnimatingOut, isSearching])

  const handleKeyPressed: KeyboardEventHandler<HTMLInputElement> = e => {
    if (e.key === 'Escape') {
      navigate(-1)
    }

    // clear out the current action if user types backspace for empty string
    if (e.currentTarget.value === '' && currentActionId && e.key === 'Backspace') {
      query.setCurrentRootAction(currentAction?.parent)
    }
  }

  return (
    <div
      className="w-full flex-1 cursor-text flex-col justify-center font-semibold md:text-xl"
      onClick={() => !isSearching && navigate('/search')}
      role="button"
      data-testid="searchButton"
    >
      <Input
        className="rounded-full bg-base-100 px-1 placeholder:text-center"
        classNames={{
          inputWrapper: 'bg-base-100 !border-base-content/30 disabled:cursor-pointer',
          base: '!px-0',
          input: twMerge(
            'placeholder:text-center focus:placeholder:text-left',
            !isSearching && 'pointer-events-none',
          ),
        }}
        endContent={
          isSearching && (
            <button
              className="bg-transparent text-base-content/30 hover:text-base-content/70"
              onClick={() => navigate(-1)}
            >
              ✕
            </button>
          )
        }
        onKeyDown={handleKeyPressed}
        placeholder={currentAction?.name || 'Search'}
        variant="bordered"
        onChange={e => setSearchText(e.target.value)}
        ref={searchRef}
        value={searchText}
        disabled={!isSearching}
        autoFocus
      />
    </div>
  )
}

export default SettingSearchBar
