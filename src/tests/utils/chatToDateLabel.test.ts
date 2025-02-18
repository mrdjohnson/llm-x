import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import moment, { Moment } from 'moment'

import { ChatModelFactory } from '~/core/chat/ChatModel.factory'
import { ChatViewModel } from '~/core/chat/ChatViewModel'

import { chatToDateLabel } from '~/utils/chatToDateLabel'

const createChatModel = (lastMessageTime: Moment) => {
  const chat = ChatModelFactory.build({ lastMessageTimestamp: lastMessageTime.valueOf() })
  return new ChatViewModel(chat)
}

describe('chatToDateLabel', () => {
  beforeEach(() => {
    // tell vitest we use mocked time
    vi.useFakeTimers()
  })

  afterEach(() => {
    // restoring date after each test run
    vi.useRealTimers()
  })

  test('correctly labels today', () => {
    const todayChat = createChatModel(moment())
    const startOfDayChat = createChatModel(moment().startOf('day'))
    const endOfDayChat = createChatModel(moment().endOf('day'))

    const yesterdayChat = createChatModel(moment().subtract(1, 'day'))
    const lastWeekChat = createChatModel(moment().subtract(1, 'week'))
    const lastYearChat = createChatModel(moment().subtract(1, 'year'))

    expect(chatToDateLabel(todayChat)).toBe('Today')
    expect(chatToDateLabel(startOfDayChat)).toBe('Today')
    expect(chatToDateLabel(endOfDayChat)).toBe('Today')

    expect(chatToDateLabel(yesterdayChat)).not.toBe('Today')
    expect(chatToDateLabel(lastWeekChat)).not.toBe('Today')
    expect(chatToDateLabel(lastYearChat)).not.toBe('Today')
  })

  test('correctly labels yesterday', () => {
    const yesterday = () => moment().subtract(1, 'day')
    const today = moment()

    const todayChat = createChatModel(today)
    const startOfDayChat = createChatModel(today.startOf('day'))
    const endOfDayChat = createChatModel(today.endOf('day'))

    const yesterdayChat = createChatModel(yesterday())
    const startOfYesterdayChat = createChatModel(yesterday().startOf('day'))
    const endOfYesterdayChat = createChatModel(yesterday().endOf('day'))
    const lastWeekChat = createChatModel(yesterday().subtract(1, 'weeks'))
    const lastYearChat = createChatModel(yesterday().subtract(1, 'years'))

    expect(chatToDateLabel(todayChat)).not.toBe('Yesterday')
    expect(chatToDateLabel(startOfDayChat)).not.toBe('Yesterday')
    expect(chatToDateLabel(endOfDayChat)).not.toBe('Yesterday')

    expect(chatToDateLabel(yesterdayChat)).toBe('Yesterday')
    expect(chatToDateLabel(startOfYesterdayChat)).toBe('Yesterday')
    expect(chatToDateLabel(endOfYesterdayChat)).toBe('Yesterday')

    expect(chatToDateLabel(lastWeekChat)).not.toBe('Yesterday')
    expect(chatToDateLabel(lastYearChat)).not.toBe('Yesterday')
  })

  test('correctly labels this week', () => {
    vi.setSystemTime(new Date('2025-02-15'))

    const startOfWeek = moment().startOf('week')
    const endOfWeek = moment().endOf('week')

    // skip today and yesterday
    const dayOfWeek = endOfWeek.subtract(2, 'days')

    while (!dayOfWeek.isBefore(startOfWeek, 'day')) {
      const chat = createChatModel(dayOfWeek)

      expect(chatToDateLabel(chat)).toBe('This Week')

      dayOfWeek.subtract(1, 'days')
    }

    const lastWeekChat = createChatModel(endOfWeek.subtract(1, 'weeks'))
    const lastYearChat = createChatModel(endOfWeek.subtract(1, 'years'))

    expect(chatToDateLabel(lastWeekChat)).not.toBe('This Week')
    expect(chatToDateLabel(lastYearChat)).not.toBe('This Week')
  })

  test('correctly labels this month', () => {
    // end of feb
    vi.setSystemTime(new Date('2025-02-28'))

    const startOfMonth = moment().startOf('month')
    const endOfMonth = moment().endOf('month')

    const dayOfMonth = endOfMonth.subtract(7, 'days')

    while (!dayOfMonth.isSame(startOfMonth, 'day')) {
      const chat = createChatModel(dayOfMonth)

      expect(chatToDateLabel(chat)).toBe(dayOfMonth.format('MMMM'))

      dayOfMonth.subtract(1, 'days')
    }

    const lastWeekChat = createChatModel(endOfMonth.subtract(1, 'days'))
    const lastYearChat = createChatModel(endOfMonth.subtract(1, 'years'))

    expect(chatToDateLabel(lastWeekChat)).not.toBe('This Week')
    expect(chatToDateLabel(lastYearChat)).not.toBe('This Week')
  })

  test('correctly labels previous months and older', () => {
    // end of feb
    vi.setSystemTime(new Date('2025-02-28'))

    const monthsAgo0 = createChatModel(moment().subtract(1, 'weeks'))
    const monthsAgo1 = createChatModel(moment().subtract(1, 'months'))
    const monthsAgo2 = createChatModel(moment().subtract(2, 'months'))

    const monthsAgo3 = createChatModel(moment().subtract(3, 'months'))
    const monthsAgo4 = createChatModel(moment().subtract(4, 'months'))
    const lastYearChat = createChatModel(moment().subtract(1, 'years'))

    expect(chatToDateLabel(monthsAgo0)).toBe('February')
    expect(chatToDateLabel(monthsAgo1)).toBe('January')
    expect(chatToDateLabel(monthsAgo2)).toBe('December')

    expect(chatToDateLabel(monthsAgo3)).toBe('Older')
    expect(chatToDateLabel(monthsAgo4)).toBe('Older')
    expect(chatToDateLabel(lastYearChat)).toBe('Older')
  })
})
