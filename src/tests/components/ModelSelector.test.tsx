import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import MatchMediaMock from 'vitest-matchmedia-mock'
import { MemoryRouter } from 'react-router'
import _ from 'lodash'

import * as router from 'react-router'

import ModelSelector from '~/components/ModelSelector'
import { setServerResponse } from '~/tests/msw'
import { OllamaModelFactory } from '~/core/LanguageModel.factory'
import { connectionStore } from '~/core/connection/ConnectionStore'
import { ConnectionViewModelTypes } from '~/core/connection/viewModels'
import { LanguageModelTypes } from '~/core/connection/types'
import { ChatModelFactory } from '~/core/chat/ChatModel.factory'

describe('ModelSelector', () => {
  const matchMediaMock = new MatchMediaMock()

  afterEach(() => {
    matchMediaMock.clear()
  })

  const expectLabelToEqualContent = (container: HTMLElement, labelText?: string) => {
    const label = container.querySelector('[data-slot="label"]')

    expect(label?.textContent).toEqual(labelText)
  }

  const expectInputToHaveValue = (container: HTMLElement, inputValue: string) => {
    const input = container.querySelector('[data-slot="input"]')

    expect(input).toHaveDisplayValue(inputValue)
  }

  describe('label', () => {
    test('shows no servers when none are connected', async () => {
      // add a connection, but its not active
      await connectionStore.addConnection('OpenAi')

      const { container } = render(
        <MemoryRouter initialEntries={['/']}>
          <ModelSelector />
        </MemoryRouter>,
      )

      expectLabelToEqualContent(container, 'No Servers connected')
    })

    test('shows servers when connected with no models', async () => {
      setServerResponse('https://api.openai.com/v1/models', {
        data: [],
      })

      const selectedConnection = await connectionStore.addConnection('OpenAi')

      await selectedConnection.fetchLmModels()

      const { container } = render(
        <MemoryRouter initialEntries={['/']}>
          <ModelSelector />
        </MemoryRouter>,
      )

      expect(connectionStore.selectedConnection?.models.length).toBe(0)

      expectLabelToEqualContent(container, 'No Open AI models available')
    })

    describe('when servers are connected and have models', () => {
      let selectedConnection: ConnectionViewModelTypes
      let selectedModel: LanguageModelTypes

      beforeEach(async () => {
        setServerResponse('http://localhost:11434/api/tags', {
          models: OllamaModelFactory.buildList(3),
        })

        selectedConnection = await connectionStore.addConnection('Ollama')

        await selectedConnection.fetchLmModels()

        expect(selectedConnection.models.length).toBe(3)

        selectedModel = selectedConnection.models[0]
      })

      test('shows nothing is selected when no model is selected', async () => {
        expect(connectionStore.selectedConnection?.models.length).toBe(3)

        const { container } = render(
          <MemoryRouter initialEntries={['/']}>
            <ModelSelector />
          </MemoryRouter>,
        )

        expectLabelToEqualContent(container, 'No Ollama models selected')
        expectInputToHaveValue(container, '')
      })

      test('shows the connection label when model is selected', async () => {
        await connectionStore.setSelectedModel(selectedModel.id, selectedConnection.id)
        expect(connectionStore.selectedModel).toBeDefined()

        const { container } = render(
          <MemoryRouter initialEntries={['/']}>
            <ModelSelector />
          </MemoryRouter>,
        )

        expectLabelToEqualContent(container, selectedConnection.label)
        expectInputToHaveValue(container, selectedModel.label)
      })

      test('is empty on mobile', async () => {
        matchMediaMock.useMediaQuery('(max-width: 768px)')

        await connectionStore.setSelectedModel(selectedModel.id, selectedConnection.id)
        expect(connectionStore.selectedModel).toBeDefined()

        const { container } = render(
          <MemoryRouter initialEntries={['/']}>
            <ModelSelector />
          </MemoryRouter>,
        )

        expectLabelToEqualContent(container, undefined)
      })

      test('displays actor length when actors are present', async () => {
        await ChatModelFactory.create({}, { transient: { actorCount: 4 } })

        const { container } = render(
          <MemoryRouter initialEntries={['/']}>
            <ModelSelector />
          </MemoryRouter>,
        )

        expectLabelToEqualContent(container, '4 models')
      })

      test('displays singular actor when only one actor present', async () => {
        await ChatModelFactory.create({}, { transient: { actorCount: 1 } })

        const { container } = render(
          <MemoryRouter initialEntries={['/']}>
            <ModelSelector />
          </MemoryRouter>,
        )

        expectLabelToEqualContent(container, '1 model')
      })
    })
  })

  describe('navigation', () => {
    const navigate = vi.fn()

    beforeEach(() => {
      vi.spyOn(router, 'useNavigate').mockImplementation(() => navigate)
    })

    test('navigates to models when there are no servers', async () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <ModelSelector />
        </MemoryRouter>,
      )

      expect(navigate).not.toHaveBeenCalled()

      const button = await screen.findByRole('button')

      fireEvent.click(button)

      await screen.findByRole('button')

      expect(navigate).toHaveBeenCalledWith('/models')
    })

    test('navigates to selected model', async () => {
      // add a connection, but its not active
      const selectedConnection = await connectionStore.addConnection('OpenAi')

      render(
        <MemoryRouter initialEntries={['/']}>
          <ModelSelector />
        </MemoryRouter>,
      )

      expect(navigate).not.toHaveBeenCalled()

      const button = await screen.findByRole('button')

      fireEvent.click(button)

      await screen.findByRole('button')

      expect(navigate).toHaveBeenCalledWith('/models/' + selectedConnection.id)
    })

    describe('with actors', () => {
      test('navigates to selected initial page on mobile', async () => {
        matchMediaMock.useMediaQuery('(max-width: 768px)')

        await ChatModelFactory.create({}, { transient: { actorCount: 2 } })

        render(
          <MemoryRouter initialEntries={['/']}>
            <ModelSelector />
          </MemoryRouter>,
        )

        expect(navigate).not.toHaveBeenCalled()

        const button = await screen.findByRole('button')

        fireEvent.click(button)

        await screen.findByRole('button')

        expect(navigate).toHaveBeenCalledWith('/initial')
      })

      test('navigates to selected chat', async () => {
        const selectedChat = await ChatModelFactory.create({}, { transient: { actorCount: 2 } })

        render(
          <MemoryRouter initialEntries={['/']}>
            <ModelSelector />
          </MemoryRouter>,
        )

        expect(navigate).not.toHaveBeenCalled()

        const button = await screen.findByRole('button')

        fireEvent.click(button)

        await screen.findByRole('button')

        expect(navigate).toHaveBeenCalledWith('/chats/' + selectedChat.id)
      })
    })
  })
})
