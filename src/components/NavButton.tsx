import { MouseEventHandler } from 'react'
import { To, useNavigate } from 'react-router-dom'

type NavButtonProps<T = Element> = React.HTMLAttributes<T> & {
  to: To
  replace?: boolean
  disabled?: boolean
}

export const NavButton = ({
  to,
  replace = false,
  onClick,
  ...rest
}: NavButtonProps<HTMLButtonElement>) => {
  const navigate = useNavigate()

  const handleClick: MouseEventHandler<HTMLButtonElement> = e => {
    onClick?.(e)

    if (!e.isDefaultPrevented()) {
      navigate(to, { replace })
    }
  }

  return <button type="button" {...rest} onClick={handleClick} />
}

export const NavButtonDiv = ({
  to,
  replace = false,
  onClick,
  ...rest
}: Omit<NavButtonProps<HTMLDivElement>, 'disabled'>) => {
  const navigate = useNavigate()

  const handleClick: MouseEventHandler<HTMLDivElement> = e => {
    onClick?.(e)

    if (!e.isDefaultPrevented()) {
      navigate(to, { replace })
    }
  }

  return <div role="button" {...rest} onClick={handleClick} />
}
