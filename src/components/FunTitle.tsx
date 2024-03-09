import { useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import _ from 'lodash'

import { settingStore } from '../models/SettingStore'

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

        <span className={className + ' link mx-0 text-primary'}>{titleSections[1]}</span>

        {titleSections[2]}
      </button>
    </span>
  )
})

export default FunTitle
