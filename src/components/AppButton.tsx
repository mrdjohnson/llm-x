import { ActionIcon, ActionIconProps, Button, ButtonProps } from '@mantine/core'
import { ButtonHTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

type AppButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonProps &
  ActionIconProps & { Component?: typeof Button | typeof ActionIcon }

export const AppButton = ({
  Component = Button,
  variant,
  className,
  color = 'gray',
  ...props
}: AppButtonProps) => {
  const classes = [className]

  if (variant === 'transparent') {
    classes.push('opacity-70 hover:opacity-100 transition-opacity duration-100 ease-in-out')
  }
  return <Component variant={variant} className={twMerge(classes)} color={color} {...props} />
}

export default AppButton
