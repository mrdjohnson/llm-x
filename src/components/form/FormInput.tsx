import { TextInput, TextInputProps } from '@mantine/core'
import { RefObject } from 'react'
import { RefCallBack } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'

type FormInputProps = Omit<TextInputProps, 'isInvalid' | 'classNames' | 'size'> & {
  ref?: RefObject<HTMLInputElement | null> | RefCallBack
}

const FormInput = (inputProps: FormInputProps) => {
  const isDisabled = inputProps.disabled
  const isInvalid = !isDisabled && !!inputProps.error
  const hasLabel = !!inputProps.label
  const hasValue = !!inputProps.value

  return (
    <div className="w-full">
      <TextInput
        type="text"
        variant="default"
        color={isInvalid ? 'red' : undefined}
        disabled={isDisabled}
        size="md"
        className={twMerge(inputProps.className, '!w-full')}
        classNames={{
          input: twMerge('w-full', hasLabel && hasValue && '!h-12 !pt-4'),
          label: twMerge(
            '!text-left absolute left-2 ',
            hasValue && 'absolute left-2 z-10 !text-sm opacity-80',
          ),
          root: 'relative',
        }}
        {...inputProps}
      />
    </div>
  )
}

export default FormInput
