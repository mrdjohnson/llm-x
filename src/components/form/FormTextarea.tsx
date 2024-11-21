import { Textarea } from '@nextui-org/react'
import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

// Weird typescript issue where it did not recognize the full typing of TextAreaProps
type FormTextareaProps = Omit<Parameters<typeof Textarea>[0], 'isInvalid'>

const FormTextarea = forwardRef((textareaProps: FormTextareaProps) => {
  const isDisabled = textareaProps.disabled || textareaProps.isDisabled
  const isInvalid = !isDisabled && !!textareaProps.errorMessage

  return (
    <div className={twMerge('w-full', isInvalid && '*:!text-error')}>
      <Textarea
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
          ),
        }}
        {...textareaProps}
      />
    </div>
  )
})

export default FormTextarea
