import { observer } from 'mobx-react-lite'

import { ollamaStore } from '~/features/ollama/OllamaStore'

const PullProgresses = observer(() => {
  const { pullProgresses } = ollamaStore

  const colorCodedProgress = {
    incomplete: 'bg-accent',
    complete: 'bg-success',
    error: 'bg-error',
  }

  return (
    <div className=" bottom-0 left-0 right-0 flex flex-col">
      {pullProgresses.map(progress => (
        <span
          role="progressbar"
          className="relative mt-2 rounded-md bg-slate-500/45"
          key={progress.id}
        >
          <span className="absolute inset-0 flex items-center justify-center ">
            <div className="relative font-semibold text-primary-content mix-blend-hard-light">
              {progress.model}: {progress.label}
              <div className="absolute inset-y-0 left-[100%] ml-2 line-clamp-1 w-screen">
                {progress.extra}
              </div>
            </div>
          </span>

          <span
            className={'block h-4 rounded-full text-center ' + colorCodedProgress[progress.status]}
            style={{ width: progress.label }}
          />
        </span>
      ))}
    </div>
  )
})

export default PullProgresses
