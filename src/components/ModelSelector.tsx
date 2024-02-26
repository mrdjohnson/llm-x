import { observer } from 'mobx-react-lite'

import ChevronDown from '../icons/ChevronDown'
import Globe from '../icons/Globe'

import { settingStore } from '../models/SettingStore'

const ModelSelector = observer(() => {
  const { selectedModel, models } = settingStore

  return (
    <div className="dropdown">
      <button
        tabIndex={0}
        role="button"
        className="btn btn-active w-full"
        disabled={!selectedModel}
      >
        {selectedModel?.name || 'No models available'}
        <ChevronDown />
      </button>

      <ul
        tabIndex={0}
        className="no-scrollbar dropdown-content z-[1] mt-2 flex max-h-80 flex-col overflow-y-scroll rounded-box border border-base-content/30 bg-base-300 p-2 shadow-2xl"
      >
        {models?.map(model => (
          <li key={model.name}>
            <input
              type="radio"
              className="btn btn-ghost btn-sm w-full place-items-center"
              aria-label={model.name}
              value={model.name}
              checked={selectedModel === model}
              onChange={() => settingStore.selectModel(model.name)}
            />
          </li>
        ))}

        <li>
          <a
            href="https://ollama.com/library"
            className="btn btn-outline btn-neutral btn-sm mt-2 flex w-full flex-row flex-nowrap place-items-center gap-2"
          >
            <span className=" whitespace-nowrap text-sm ">Ollama Library</span>
            <Globe />
          </a>
        </li>
      </ul>
    </div>
  )
})

export default ModelSelector
