import { useMemo } from 'react'
import { observer } from 'mobx-react-lite'
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

const FunTitle = observer(({ className }: { className?: string }) => {
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
            'mx-0 bg-gradient-to-b from-primary to-secondary to-70% bg-clip-text font-semibold text-transparent transition-all duration-700 ease-in-out hover:text-primary',
          )}
        >
          {titleSections[1]}
        </span>

        {titleSections[2]}
      </button>
    </span>
  )
})

export default FunTitle
