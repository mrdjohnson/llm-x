import { useMemo } from 'react'
import _ from 'lodash'
import { twMerge } from 'tailwind-merge'

import { settingStore } from '~/core/setting/SettingStore'

const xWords = [
  'Excellence',
  'Extraordinary',
  'Exceptional',
  'Exquisite',
  'Expertise',
  'Exuberance',
  'Exciting',
  'Expert',
  'Apex',
  'Codex',
  'X',
  'X',
  'X',
  'X',
  'X',
  'X',
  'X',
  'X',
]

const FunTitle = ({ className }: { className?: string }) => {
  const funTitle = settingStore.funTitle ?? 'X'

  const titleSections = useMemo<[string, string, string]>(() => {
    return funTitle?.split(/([xX])/g) as [string, string, string]
  }, [funTitle])

  const sampleXWord = () => {
    let sample = funTitle

    while (sample === funTitle) {
      sample = _.sample(xWords) ?? 'X'
    }

    settingStore.setFunTitle(sample)
  }

  return (
    <span className={className}>
      {'LLM '}

      <button onClick={sampleXWord}>
        {titleSections[0]}

        <span
          className={twMerge(
            className,
            FunTitle.direction,
            'mx-0 from-primary to-secondary to-70% bg-clip-text font-semibold text-transparent transition-all duration-700 ease-in-out hover:text-primary',
          )}
        >
          {titleSections[1]}
        </span>

        {titleSections[2]}
      </button>
    </span>
  )
}

FunTitle.direction = _.sample([
  'bg-gradient-to-br',
  'bg-gradient-to-tr',

  'bg-gradient-to-bl',
  'bg-gradient-to-tl',
])

export default FunTitle
