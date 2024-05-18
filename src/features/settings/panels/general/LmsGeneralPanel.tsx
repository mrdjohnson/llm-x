import { useRef } from 'react'
import { observer } from 'mobx-react-lite'

import HostInput from '~/components/HostInput'
import NumberInput from '~/components/form/NumberInput'
import EnabledCheckbox from '~/components/EnabledCheckbox'

import { DefaultLmsHost, settingStore } from '~/models/SettingStore'

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
        <div className="flex-grow-1 flex w-full flex-1 flex-col">
          <input
            type="range"
            min={0}
            max={1}
            value={settingStore.lmsTemperature}
            className="range range-sm disabled:[--range-shdw:gray]"
            step={0.05}
            onChange={e => settingStore.setLmsTemperature(e.target.valueAsNumber)}
            disabled={!settingStore.lmsEnabled}
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

        <div className="flex-shrink-1">
          <NumberInput
            value={settingStore.lmsTemperature}
            step={0.05}
            min={0}
            precision={2}
            placeholder="50"
            className="max-w-[9ch]"
            onChange={settingStore.setLmsTemperature}
            disabled={!settingStore.lmsEnabled}
          />
        </div>
      </div>
    </form>
  )
})

const LmsGeneralPanel = observer(() => {
  return (
    <div className="flex h-full w-full flex-col gap-4">
      <EnabledCheckbox
        label="Text generation through LM Studio:"
        isEnabled={settingStore.lmsEnabled}
        onChange={settingStore.setLmsEnabled}
        fetchModels={settingStore.fetchLmsModels}
      />

      <HostInput
        defaultValue={settingStore.lmsHost}
        hasServer={settingStore.isLmsServerConnected}
        fetchModels={settingStore.fetchLmsModels}
        isEnabled={settingStore.lmsEnabled}
        label="LM Studio Host:"
        placeHolder={DefaultLmsHost}
        setHost={settingStore.setLmsHost}
      />

      <TemperatureInput />
    </div>
  )
})

export default LmsGeneralPanel
