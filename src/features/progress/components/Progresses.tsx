import { twMerge } from 'tailwind-merge'

import { progressStore } from '~/core/ProgressStore'

const colorCodedProgress = {
  incomplete: 'bg-accent',
  complete: 'bg-success',
  error: 'bg-error',
}

const Progresses = () => {
  const { progresses } = progressStore

  return (
    <div className="bottom-0 left-0 right-0 flex flex-col">
      {progresses.map(progress => (
        <span
          role="progressbar"
          className="relative mt-2 rounded-md bg-slate-500/45"
          key={progress.id}
        >
          <span className="absolute inset-0 flex items-center justify-center">
            <div className="text-primary-content relative font-semibold mix-blend-hard-light">
              {progress.label}: {progress.value}%
              <div className="absolute inset-y-0 left-[100%] ml-2 line-clamp-1 w-screen">
                {progress.subLabel}
              </div>
            </div>
          </span>

          <span
            className={twMerge(
              'block h-4 rounded-full text-center',
              colorCodedProgress[progress.status],
            )}
            style={{ width: progress.value + '%' }}
          />
        </span>
      ))}
    </div>
  )
}

export default Progresses
