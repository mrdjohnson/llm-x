import { observer } from 'mobx-react-lite'

import ChevronDown from '../icons/ChevronDown'
import Globe from '../icons/Globe'

import { settingStore } from '../models/SettingStore'

const ModalSelector = observer(() => {
  const { selectedModel, models } = settingStore

  return (
    <div className="dropdown">
      <button tabIndex={0} role="button" className="btn btn-active w-full" disabled={!selectedModel}>
        {selectedModel?.name || 'No models available'}
        <ChevronDown />
      </button>

      <ul
        tabIndex={0}
        className="dropdown-content z-[1] p-2 shadow-2xl bg-base-300 rounded-box mt-2 border border-base-content/30 max-h-52 flex flex-col"
      >
        {models?.map(model => (
          <li key={model.name}>
            <input
              type="radio"
              className="btn btn-sm btn-ghost w-full place-items-center"
              aria-label={model.name}
              value={model.name}
              checked={selectedModel === model}
              onChange={() => settingStore.selectModel(model.name)}
            />
          </li>
        ))}

        <li>
          <a href="https://ollama.com/library" className="btn btn-outline btn-sm btn-neutral place-items-center flex flex-row flex-nowrap gap-2 w-full mt-2">
            <span className=" text-sm whitespace-nowrap ">Ollama Library</span>
            <Globe />
          </a>
        </li>
      </ul>
    </div>
  )
})

export default ModalSelector
