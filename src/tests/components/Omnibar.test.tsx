import { afterEach, beforeEach, describe, expect, test, vi, vitest } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { KBarProvider } from 'kbar'
import * as router from 'react-router'
import userEvent from '@testing-library/user-event'

import OmniBar from '~/components/OmniBar'

import { settingStore } from '~/core/setting/SettingStore'
import { chatStore } from '~/core/chat/ChatStore'
import { focusStore } from '~/core/FocusStore'
import { connectionStore } from '~/core/connection/ConnectionStore'
import { setServerResponse } from '~/tests/msw'

describe('OmniBar', () => {
  const navigate = vi.fn()

  beforeEach(() => {
    vi.spyOn(router, 'useNavigate').mockImplementation(() => navigate)
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const renderOmniBar = () => {
    return render(
      <MemoryRouter initialEntries={['/']}>
        <KBarProvider>
          <OmniBar />
        </KBarProvider>
      </MemoryRouter>,
    )
  }

  describe('keyboard shortcuts', () => {
    let unmountOmnibar: () => void

    beforeEach(() => {
      const { unmount } = renderOmniBar()

      unmountOmnibar = unmount

      expect(navigate).not.toHaveBeenCalled()
    })

    afterEach(() => {
      unmountOmnibar()
    })

    test('registers Ctrl+K to navigate to search', async () => {
      await userEvent.keyboard('{Control>}{K}')

      await waitFor(() => {
        expect(navigate).toHaveBeenCalledWith('/search')
      })
    })

    test('registers Ctrl+/ to navigate to initial settings', async () => {
      await userEvent.keyboard('{Control>}/')

      await waitFor(() => {
        expect(navigate).toHaveBeenCalledWith('/initial')
      })
    })

    test('registers Ctrl+. to navigate to model panel', async () => {
      expect(navigate).not.toHaveBeenCalled()

      await userEvent.keyboard('{Control>}{.}')

      await waitFor(() => {
        expect(navigate).toHaveBeenCalledWith('/models')
      })
    })

    test('registers Ctrl+. to navigate to selected model panel', async () => {
      setServerResponse('https://api.openai.com/v1/models', {
        data: [],
      })

      const selectedConnection = await connectionStore.addConnection('OpenAi')

      await userEvent.keyboard('{Control>}{.}')

      await waitFor(() => {
        expect(navigate).toHaveBeenCalledWith('/models/' + selectedConnection.id)
      })
    })

    test('registers Ctrl+; to open persona menu', async () => {
      await userEvent.keyboard('{Control>}{;}')

      await waitFor(() => {
        expect(navigate).toHaveBeenCalledWith('/personas')
      })
    })

    test('registers Ctrl+B to toggle sidebar', async () => {
      expect(settingStore.setting.isSidebarOpen).toBe(true)

      await userEvent.keyboard('{Control>}{B}')

      expect(settingStore.setting.isSidebarOpen).toBe(false)
    })

    test('registers Cmd+Shift+O to create a new chat', async () => {
      vitest.spyOn(chatStore, 'createChat')

      expect(chatStore.createChat).not.toHaveBeenCalled()

      await userEvent.keyboard('{Control>}{Shift>}{O}')

      expect(chatStore.createChat).toHaveBeenCalled()
    })

    test('registers Ctrl+J to focus chat input', async () => {
      vitest.spyOn(focusStore, 'focusChatInput')

      expect(focusStore.focusChatInput).not.toHaveBeenCalled()

      await userEvent.keyboard('{Control>}{J}')

      expect(focusStore.focusChatInput).toHaveBeenCalled()
    })
  })
})
