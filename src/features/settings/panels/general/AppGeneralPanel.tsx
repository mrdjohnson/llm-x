import _ from 'lodash'
import { useEffect, useMemo, useState } from 'react'
import { useSpeech, useVoices } from 'react-text-to-speech'
import {
  Card,
  Text,
  SegmentedControl,
  Group,
  Button,
  Typography,
  TextInput,
  Switch,
  Select,
} from '@mantine/core'
import { useForm } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'

import ThemeSelector from '~/components/ThemeSelector'
import AttachmentWrapper from '~/components/AttachmentWrapper'

import DocumentArrowDown from '~/icons/DocumentArrowDown'
import DocumentArrowUp from '~/icons/DocumentArrowUp'
import PlayPause from '~/icons/PlayPause'
import Stop from '~/icons/Stop'

import { voiceStore } from '~/core/voice/VoiceStore'
import { VoiceModel } from '~/core/voice/VoiceModel'

import { DATABASE_TABLES } from '~/core/db'
import { CURRENT_DB_TIMESTAMP_MILLISECONDS } from '~/core/setting/SettingModel'

const DownloadSelector = () => {
  const [includeImages, setIncludeImages] = useState(true)

  const exportAll = async () => {
    const dataToExport: Record<string, unknown> = {
      databaseTimestamp: CURRENT_DB_TIMESTAMP_MILLISECONDS,
    }

    for (const table of DATABASE_TABLES) {
      if (table.hasParentExportTable) continue

      dataToExport[table.getTableName()] = await table.exportAll({ includeImages })
    }

    const data = JSON.stringify(dataToExport, null, 2)

    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }))
    link.download = 'llm-x-data.json'
    link.click()
  }

  return (
    <Card className="mt-2 flex flex-col justify-center" withBorder radius="md" p="sm">
      <Typography>
        <h4> Import / Export </h4>
      </Typography>

      <Group>
        <Text>Include any images in download? (increases file size):</Text>

        <div className="join">
          <SegmentedControl
            radius="lg"
            value={includeImages ? 'yes' : 'no'}
            onChange={value => setIncludeImages(value === 'yes')}
            data={[
              { label: 'Yes', value: 'yes' },
              { label: 'No', value: 'no' },
            ]}
            size="xs"
          />
        </div>
      </Group>

      <Card.Section className="flex flex-row gap-2 p-2">
        <Group justify="space-evenly">
          <AttachmentWrapper accept=".json">
            <Button variant="light" title="Import All" rightSection={<DocumentArrowUp />}>
              Import
            </Button>
          </AttachmentWrapper>

          <Button
            variant="light"
            title="Export All"
            onClick={exportAll}
            rightSection={<DocumentArrowDown />}
          >
            Export
          </Button>
        </Group>
      </Card.Section>
    </Card>
  )
}

const SpeechSelector = () => {
  const { voices } = useVoices()

  const {
    setValue,
    handleSubmit,
    reset,
    watch,
    register,
    resetField,
    formState: { isDirty },
  } = useForm<VoiceModel>()

  const voice = voiceStore.selectedVoice

  const [exampleText, setExampleText] = useState('This app is amazing!')
  const [autoPlayVoice, setAutoPlayVoice] = useState(false)

  const handleFormSubmit = handleSubmit(async formData => {
    const nextVoice = await voiceStore.updateVoice(formData)

    reset(nextVoice)
  })

  const setLanguage = (nextLanguage: string | null) => {
    const oldLanguage = voice?.language || ''
    nextLanguage ||= ''

    resetField('language')
    setValue('language', nextLanguage, { shouldDirty: oldLanguage !== nextLanguage })
  }

  const setVoiceUri = (nextVoiceUri: string | null) => {
    const oldVoiceUri = voice?.voiceUri || ''
    nextVoiceUri ||= ''

    resetField('voiceUri')
    setValue('voiceUri', nextVoiceUri, { shouldDirty: oldVoiceUri !== nextVoiceUri })
  }

  const clearValues = () => {
    setLanguage(null)
    setVoiceUri(null)
  }

  const selectedLanguage = watch('language') || ''
  const selectedVoiceUri = watch('voiceUri') || ''

  const localVoices = useMemo(() => {
    return _.filter(voices, { localService: true }).map(voice => ({
      value: voice.voiceURI,
      label: voice.name,
      lang: voice.lang,
    }))
  }, [voices])

  const filteredVoices = useMemo(() => {
    if (_.isEmpty(selectedLanguage)) return localVoices

    return localVoices.filter(({ lang }) => lang === selectedLanguage)
  }, [selectedLanguage, localVoices])

  const languages = useMemo(() => {
    return _.chain(localVoices).map('lang').uniq().value()
  }, [localVoices])

  useEffect(() => {
    reset({
      id: voice?.id,
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
    <Card withBorder radius="md">
      <Typography>
        <h4>Text to speech</h4>
      </Typography>
      <form onSubmit={handleFormSubmit} className="flex flex-col gap-3 pt-2">
        <TextInput
          label="Sample Input"
          size="md"
          value={exampleText}
          onChange={e => setExampleText(e.target.value)}
          rightSection={
            <div className="flex h-full items-center gap-2">
              <button
                className={twMerge(
                  'block text-error opacity-30 hover:scale-110 hover:opacity-100',
                  speechStatus === 'stopped' && 'hidden',
                )}
                onClick={stop}
                type="button"
              >
                <Stop />
              </button>

              <button
                className={twMerge(
                  'h-fit w-fit opacity-30 hover:scale-110 hover:opacity-100',
                  speechStatus === 'started' && 'animate-pulse opacity-100',
                )}
                onClick={speechStatus === 'started' ? pause : start}
                type="button"
              >
                <PlayPause />
              </button>
            </div>
          }
        />

        <Select
          label="Language"
          size="md"
          data={languages}
          value={selectedLanguage || null}
          {...register('language')}
          onChange={setLanguage}
          searchable
          allowDeselect
          clearable
        />

        <Select
          label="Voice"
          size="md"
          data={filteredVoices}
          value={selectedVoiceUri || null}
          {...register('voiceUri')}
          onChange={setVoiceUri}
          searchable
          allowDeselect
          clearable
        />

        <Group>
          <Switch
            label="Auto play voice (for testing)"
            checked={autoPlayVoice}
            onChange={() => setAutoPlayVoice(!autoPlayVoice)}
            withThumbIndicator
            size="md"
          />

          <div className="ml-auto flex w-fit flex-row gap-2">
            <Button
              type="button"
              variant="default"
              className="btn btn-outline md:btn-ghost md:btn-sm md:mx-4"
              onClick={clearValues}
              disabled={!isDirty && _.isEmpty(selectedLanguage || selectedVoiceUri)}
            >
              Clear
            </Button>

            <Button
              type="button"
              variant="outline"
              color="red"
              className="btn btn-outline md:btn-ghost md:btn-sm md:mx-4"
              onClick={() => reset()}
              disabled={!isDirty}
            >
              Reset
            </Button>

            <Button
              type="submit"
              className="btn btn-primary md:btn-sm"
              onClick={handleFormSubmit}
              disabled={!isDirty}
            >
              Save
            </Button>
          </div>
        </Group>
      </form>
    </Card>
  )
}

const AppGeneralPanel = () => {
  return (
    <div className="flex w-full flex-col gap-4">
      <ThemeSelector />

      <DownloadSelector />

      <SpeechSelector />
    </div>
  )
}

export default AppGeneralPanel
