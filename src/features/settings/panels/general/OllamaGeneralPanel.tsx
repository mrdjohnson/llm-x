import { useRef } from 'react'
import { observer } from 'mobx-react-lite'
import {
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react'

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

const TemperatureInput = observer(() => {
  const rangeRef = useRef<HTMLInputElement>(null)

  return (
    <form onSubmit={e => e.preventDefault()} className="form-control flex gap-2">
      <span
        className="label-text tooltip tooltip-right z-30 w-fit text-sm"
        data-tip="How creative the model reponse should be"
      >
        Temperature:
      </span>

      <div className="flex flex-row gap-3 align-middle">
        <div className="flex flex-1 flex-col">
          <input
            type="range"
            min={0}
            max={1}
            value={settingStore.temperature}
            className="range range-sm"
            step={0.05}
            onChange={e => settingStore.setTemperature(e.target.valueAsNumber)}
            ref={rangeRef}
          />

          <div
            className="flex w-full gap-2 [&>span]:flex-1"
            onClick={() => rangeRef.current?.focus()}
          >
            <span>Consistant</span>
            <span className="text-center">|</span>
            <span className="text-right">Creative</span>
          </div>
        </div>

        <NumberInput
          value={settingStore.temperature}
          step={0.05}
          min={0}
          onChange={(_valueAsString, valueAsNumber) => settingStore.setTemperature(valueAsNumber)}
        >
          <NumberInputField className="input input-bordered max-w-24 focus:!outline-none" />

          <NumberInputStepper className="p-1 pr-2">
            <NumberIncrementStepper className="text-base-content/30 hover:text-base-content" />
            <NumberDecrementStepper className="text-base-content/30 hover:text-base-content" />
          </NumberInputStepper>
        </NumberInput>
      </div>
    </form>
  )
})

const OllamaGeneralPanel = observer(() => {
  return (
    <div className="flex h-full w-full flex-col gap-4">
      <HostInput />

      <KeepAliveInput />

      <TemperatureInput />
    </div>
  )
})

export default OllamaGeneralPanel
