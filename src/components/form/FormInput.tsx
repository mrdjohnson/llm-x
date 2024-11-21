import { Input, InputProps } from '@nextui-org/react'
import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

type FormInputProps = Omit<InputProps, 'isInvalid'>

const FormInput = forwardRef((inputProps: FormInputProps) => {
  const isDisabled = inputProps.disabled || inputProps.isDisabled
  const isInvalid = !isDisabled && !!inputProps.errorMessage

  return (
    <div className={twMerge('w-full', isInvalid && '*:!text-error')}>
      <Input
        type="text"
        variant="bordered"
        isInvalid={isInvalid}
        isDisabled={isDisabled}
        classNames={{
          label: isInvalid ? '!text-error' : '!text-base-content/45',
          inputWrapper: twMerge(
            '!bg-base-transparent border rounded-md border-base-content/30',
            isInvalid && '!border-error',
            isDisabled && 'opacity-30 hover:!border-base-content/30',
            inputProps.variant === 'underlined' && 'border-0 border-b-1',
          ),
          input: twMerge(inputProps.variant === 'underlined' && '!text-base-content'),
        }}
        {...inputProps}
      />
    </div>
  )
})

export default FormInput
