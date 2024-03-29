import { observer } from 'mobx-react-lite'
import {
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react'

import ThemeSelector from '~/components/ThemeSelector'
import HostInput from '~/components/HostInput'

import { settingStore } from '~/models/SettingStore'

const KeepAliveInput = observer(() => {
  return (
    <form onSubmit={e => e.preventDefault()} className="form-control flex gap-2">
      <span
        className="label-text tooltip tooltip-right z-30 w-fit text-sm"
        data-tip="How long a model should be waiting for input"
      >
        Keep alive time:
      </span>

      <NumberInput
        value={settingStore.keepAliveTime}
        max={90}
        step={5}
        min={5}
        onChange={(_valueAsString, valueAsNumber) => settingStore.setKeepAliveTime(valueAsNumber)}
      >
        <NumberInputField className="input input-bordered focus:!outline-none" />

        <NumberInputStepper className="p-1 pr-2">
          <NumberIncrementStepper className="text-base-content/30 hover:text-base-content" />
          <NumberDecrementStepper className="text-base-content/30 hover:text-base-content" />
        </NumberInputStepper>
      </NumberInput>
    </form>
  )
})

const General = observer(() => {
  return (
    <div className="flex w-full flex-col gap-4">
      <HostInput />

      <KeepAliveInput />

      <div className="mt-auto">
        <ThemeSelector />
      </div>
    </div>
  )
})

export default General
