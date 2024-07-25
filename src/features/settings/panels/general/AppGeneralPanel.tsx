import { observer } from 'mobx-react-lite'
import { getSnapshot } from 'mobx-state-tree'
import { useEffect, useState } from 'react'
import { useSpeech, useVoices } from 'react-text-to-speech'
import { Select, SelectItem, Switch } from '@nextui-org/react'
import { useForm } from 'react-hook-form'

import ThemeSelector from '~/components/ThemeSelector'
import AttachmentWrapper from '~/components/AttachmentWrapper'
import FormInput from '~/components/form/FormInput'

import DocumentArrowDown from '~/icons/DocumentArrowDown'
import DocumentArrowUp from '~/icons/DocumentArrowUp'
import PlayPause from '~/icons/PlayPause'
import Stop from '~/icons/Stop'

import { personaStore } from '~/models/PersonaStore'
import { settingStore } from '~/models/SettingStore'
import { connectionModelStore } from '~/features/connections/ConnectionModelStore'

import { ChatStoreSnapshotHandler } from '~/utils/transfer/ChatStoreSnapshotHandler'

const DownlodSelector = () => {
  const [includeImages, setIncludeImages] = useState(true)

  const exportAll = async () => {
    const data = JSON.stringify({
      chatStore: await ChatStoreSnapshotHandler.formatChatStoreToExport({ includeImages }),
      personaStore: getSnapshot(personaStore),
      settingStore: getSnapshot(settingStore),
      connectionStore: getSnapshot(connectionModelStore.dataStore),
    })

    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }))
    link.download = 'llm-x-data.json'
    link.click()
  }

  return (
    <div className="mt-2 flex flex-col justify-center">
      <span className="label w-fit gap-2"> Import / Export </span>

      <label className="label w-fit gap-2 p-0">
        <span className="label-text">Include any images in download? (increases file size):</span>

        <div className="join">
          {[true, false].map(isEnabled => (
            <button
              className={
                'btn join-item btn-sm mr-0 ' +
                (includeImages === isEnabled
                  ? 'btn-active cursor-default bg-base-300 underline underline-offset-2 '
                  : 'btn bg-base-100')
              }
              onClick={() => setIncludeImages(isEnabled)}
              key={isEnabled ? 0 : 1}
            >
              {isEnabled ? 'Yes' : 'No'}
            </button>
          ))}
        </div>
      </label>

      <div className="flex flex-row gap-2">
        <AttachmentWrapper accept=".json">
          <button className="btn btn-neutral" title="Import All">
            Import <DocumentArrowUp />
          </button>
        </AttachmentWrapper>

        <button className="btn btn-neutral" title="Export All" onClick={exportAll}>
          Export <DocumentArrowDown />
        </button>
      </div>
    </div>
  )
}

type VoiceFormDataType = {
  language: string
  voiceUri: string
}

const SpeechSelector = observer(() => {
  const { languages, voices } = useVoices()

  const {
    handleSubmit,
    reset,
    watch,
    register,
    formState: { isDirty },
  } = useForm<VoiceFormDataType>()

  const { voice } = settingStore

  const [exampleText, setExampleText] = useState('This app is amazing!')
  const [autoPlayVoice, setAutoPlayVoice] = useState(true)

  const handleFormSubmit = handleSubmit(formData => {
    const { language, voiceUri } = formData

    settingStore.setVoice(language, voiceUri)

    reset(voice)
  })

  const selectedLanguage = watch('language')
  const selectedVoiceUri = watch('voiceUri')

  useEffect(() => {
    reset({
      language: voice?.language || '',
      voiceUri: voice?.voiceUri || '',
    })
  }, [voice?.id])

  useEffect(() => {
    if (!isDirty || !autoPlayVoice) return

    start()
  }, [selectedLanguage, selectedVoiceUri, isDirty])

  const { speechStatus, start, pause, stop } = useSpeech({
    text: exampleText,
    lang: selectedLanguage,
    voiceURI: selectedVoiceUri,
  })

  return (
    <form
      onSubmit={handleFormSubmit}
      className="flex flex-col gap-3 rounded-md border border-base-content/30 p-2"
    >
      <span className="pb-2">Text to speech:</span>

      <FormInput
        label="Sample Input"
        className="items-center"
        value={exampleText}
        onChange={e => setExampleText(e.target.value)}
        endContent={
          <div className="flex h-full items-center gap-2">
            <button
              className={
                'text-error opacity-30 hover:scale-110 hover:opacity-100 ' +
                (speechStatus === 'stopped' ? ' hidden' : ' block')
              }
              onClick={stop}
              type="button"
            >
              <Stop />
            </button>

            <button
              className={
                'h-fit w-fit opacity-30 hover:scale-110 hover:opacity-100 ' +
                (speechStatus === 'started' ? ' animate-pulse opacity-100' : '')
              }
              onClick={speechStatus === 'started' ? pause : start}
              type="button"
            >
              <PlayPause />
            </button>
          </div>
        }
      />

      <Select
        className="w-full min-w-[20ch] rounded-md border border-base-content/30 bg-transparent"
        size="sm"
        classNames={{
          value: '!text-base-content min-w-[20ch]',
          trigger: 'bg-base-100 hover:!bg-base-200 rounded-md',
          popoverContent: 'text-base-content bg-base-100',
        }}
        selectedKeys={[selectedLanguage]}
        label="Language"
        {...register('language')}
      >
        {languages
          .map(language => (
            <SelectItem
              key={language}
              value={language}
              className="w-full !min-w-[13ch] text-base-content"
              classNames={{
                description: ' text',
              }}
            >
              {language}
            </SelectItem>
          ))
          .concat(
            <SelectItem
              key={''}
              value={''}
              className="w-full !min-w-[13ch] text-base-content"
              classNames={{
                description: ' text',
              }}
            >
              {''}
            </SelectItem>,
          )}
      </Select>

      <Select
        className="w-full min-w-[20ch] rounded-md border border-base-content/30 bg-transparent"
        size="sm"
        classNames={{
          value: '!text-base-content min-w-[20ch]',
          trigger: 'bg-base-100 hover:!bg-base-200 rounded-md',
          popoverContent: 'text-base-content bg-base-100',
        }}
        selectedKeys={[selectedVoiceUri]}
        label="Voice"
        {...register('voiceUri')}
      >
        {voices
          .filter(({ lang }) => lang === selectedLanguage)
          .map(({ voiceURI, name }) => (
            <SelectItem
              key={voiceURI}
              value={voiceURI}
              className="w-full !min-w-[13ch] text-base-content"
              classNames={{
                description: ' text',
              }}
            >
              {name}
            </SelectItem>
          ))}
      </Select>

      <div className="flex flex-row">
        <Switch
          isSelected={autoPlayVoice}
          onChange={() => setAutoPlayVoice(!autoPlayVoice)}
          size="sm"
        >
          Auto play voice
        </Switch>

        <div className="ml-auto flex w-fit flex-row gap-2">
          <button
            type="button"
            className="btn btn-outline md:btn-ghost md:btn-sm md:mx-4"
            onClick={() => {
              console.log('resetting')
              return reset()
            }}
            disabled={!isDirty}
          >
            Reset
          </button>

          <button
            type="submit"
            className="btn btn-primary md:btn-sm"
            onClick={handleFormSubmit}
            disabled={!isDirty}
          >
            Save
          </button>
        </div>
      </div>
    </form>
  )
})

const AppGeneralPanel = observer(() => {
  return (
    <div className="flex w-full flex-col gap-4">
      <ThemeSelector />

      <DownlodSelector />

      <SpeechSelector />
    </div>
  )
})

export default AppGeneralPanel
