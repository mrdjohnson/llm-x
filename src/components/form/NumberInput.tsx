import _ from 'lodash'
import { HTMLProps } from 'react'

import ChevronDown from '~/icons/ChevronDown'

type NumberInputProps = Omit<HTMLProps<HTMLInputElement>, 'onChange'> & {
  value?: number
  onChange: (nextValue: number) => void
  step?: number
  min?: number
  max?: number
  precision?: number
}

const NumberInput = ({
  value,
  onChange,
  disabled,
  step = 1,
  min,
  max,
  precision,
  className = '',
  ...props
}: NumberInputProps) => {
  const increaseDisabled = disabled || _.gt((value || 0) + step, max)
  const decreaseDisabled = disabled || _.lt((value || 0) - step, min)

  return (
    <div
      className={
        'flex w-full flex-row gap-2 overflow-hidden rounded-md border border-base-content/20 outline-transparent focus:!border-0 focus:bg-red-300 focus:!outline-none ' +
        (disabled ? ' cursor-not-allowed bg-base-200' : ' bg-transparent ')
      }
    >
      <input
        type="number"
        value={value && _.ceil(value, precision)}
        onChange={e => onChange(e.target.valueAsNumber)}
        className={'input w-full focus:border-transparent focus:!outline-none ' + className}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        {...props}
      />

      <div className="flex flex-col justify-between">
        <button
          type="button"
          className={
            'btn btn-square btn-xs rounded-none opacity-70 ' +
            (increaseDisabled ? 'cursor-not-allowed ' : ' group hover:scale-100 hover:opacity-100')
          }
          onClick={() => onChange((value || 0) + step)}
          disabled={increaseDisabled}
        >
          <ChevronDown className="rotate-180 !stroke-2" />
        </button>

        <button
          type="button"
          className={
            'btn btn-square btn-xs rounded-none opacity-70 ' +
            (decreaseDisabled ? 'cursor-not-allowed ' : ' group hover:scale-100 hover:opacity-100')
          }
          onClick={() => onChange((value || 0) - step)}
          disabled={decreaseDisabled}
        >
          <ChevronDown className="!stroke-2" />
        </button>
      </div>
    </div>
  )
}

export default NumberInput
