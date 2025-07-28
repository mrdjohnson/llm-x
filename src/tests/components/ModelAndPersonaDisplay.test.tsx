import { afterAll, afterEach, describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import _ from 'lodash'
import MatchMediaMock from 'vitest-matchmedia-mock'

import ModelAndPersonaDisplay from '~/components/ModelAndPersonaDisplay'
import { ChatModelFactory } from '~/core/chat/ChatModel.factory'
import { ActorModelFactory } from '~/core/actor/ActorModel.factory'

describe('ModelAndPersonaDisplay', () => {
  const matchMediaMock = new MatchMediaMock()

  afterEach(() => {
    matchMediaMock.clear()
  })

  afterAll(() => {
    matchMediaMock.destroy()
  })

  const expectModelButtonTextToEqual = async (text: string) => {
    const buttons = await screen.findAllByRole('button')

    expect(buttons[0].textContent).toEqual(text)
  }

  const expectPersonasButtonTextToEqual = async (text: string) => {
    const buttons = await screen.findAllByRole('button')

    expect(buttons[1].textContent).toEqual(text)
  }

  test('shows empty buttons when nothing is selected', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <ModelAndPersonaDisplay />
      </MemoryRouter>,
    )

    expect(container).not.toBeEmptyDOMElement()

    await expectModelButtonTextToEqual('No models selected')
    await expectPersonasButtonTextToEqual('No personas selected')
  })

  test('shows nothing when mobile screen', async () => {
    matchMediaMock.useMediaQuery('(max-width: 768px)')

    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <ModelAndPersonaDisplay />
      </MemoryRouter>,
    )

    expect(container).toBeEmptyDOMElement()
  })

  describe('chat actors', () => {
    test('shows actor model name', async () => {
      const chat = await ChatModelFactory.withOptions({ actorCount: 1 }).create()

      const [actor] = chat.actors

      render(
        <MemoryRouter initialEntries={['/']}>
          <ModelAndPersonaDisplay />
        </MemoryRouter>,
      )

      await expectModelButtonTextToEqual('Model: ' + actor.label)
      await expectPersonasButtonTextToEqual('No personas selected')
    })

    test('shows +x when multiple actors exist', async () => {
      const otherActors = await ActorModelFactory.withOptions({
        modelParams: {
          name: 'Other Actor',
        },

        connectionParams: {
          type: 'Ollama',
        },
      }).createList(4)

      const actor = await ActorModelFactory.withOptions({
        modelParams: {
          name: 'First Actor',
        },

        connectionParams: {
          type: 'Ollama',
        },
      }).create()

      // add a connection, but its not active
      await ChatModelFactory.withOptions({
        actors: [actor, ...otherActors],
      }).create()

      render(
        <MemoryRouter initialEntries={['/']}>
          <ModelAndPersonaDisplay />
        </MemoryRouter>,
      )

      await expectModelButtonTextToEqual('Model: First Actor +4')
      await expectPersonasButtonTextToEqual('No personas selected')
    })
  })
})
