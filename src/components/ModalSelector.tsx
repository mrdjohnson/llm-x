import { observer } from 'mobx-react-lite'

import ChevronDown from '../icons/ChevronDown'
import { settingStore } from '../models/SettingStore'

const ModalSelector = observer(() => {
  const { selectedModel, models } = settingStore

  return (
    <div className="dropdown">
      <button tabIndex={0} role="button" className="btn btn-active" disabled={!selectedModel}>
        {selectedModel?.name || 'No models available'}
        <ChevronDown />
      </button>

      <ul
        tabIndex={0}
        className="dropdown-content z-[1] p-2 shadow-2xl bg-base-300 rounded-box w-52 mt-2 border border-base-content/30"
      >
        {models?.map(model => (
          <li key={model.name}>
            <input
              type="radio"
              className="btn btn-sm btn-block btn-ghost justify-start"
              aria-label={model.name}
              value={model.name}
              checked={selectedModel === model}
              onChange={() => settingStore.selectModel(model.name)}
            />
          </li>
        ))}
      </ul>
    </div>
  )
})

export default ModalSelector
