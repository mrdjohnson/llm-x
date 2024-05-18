import { useRef } from 'react'
import { observer } from 'mobx-react-lite'

import HostInput from '~/components/HostInput'
import NumberInput from '~/components/form/NumberInput'

import { DefaultHost, settingStore } from '~/models/SettingStore'

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
        value={settingStore.ollamaKeepAliveTime}
        max={90}
        step={5}
        min={0}
        placeholder="20"
        onChange={settingStore.setKeepAliveTime}
      />
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
        <div className="flex-grow-1 flex w-full flex-1 flex-col">
          <input
            type="range"
            min={0}
            max={1}
            value={settingStore.ollamaTemperature}
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

        <div className="flex-shrink-1">
          <NumberInput
            value={settingStore.ollamaTemperature}
            step={0.05}
            min={0}
            precision={2}
            placeholder="50"
            className="max-w-[9ch]"
            onChange={settingStore.setTemperature}
          />
        </div>
      </div>
    </form>
  )
})

const OllamaGeneralPanel = observer(() => {
  return (
    <div className="flex h-full w-full flex-col gap-4">
      <HostInput
        defaultValue={settingStore.ollamaHost}
        fetchModels={settingStore.fetchOllamaModels}
        hasServer={settingStore.isServerConnected}
        isEnabled
        label="Ollama Host:"
        placeHolder={DefaultHost}
        setHost={settingStore.setHost}
      />

      <KeepAliveInput />

      <TemperatureInput />
    </div>
  )
})

export default OllamaGeneralPanel
