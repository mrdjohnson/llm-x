import moment from 'moment'

import { type ChatViewModel } from '~/core/chat/ChatViewModel'

export const chatToDateLabel = (chat: ChatViewModel) => {
  const sentTime = moment(chat.source.lastMessageTimestamp)

  const today = moment().startOf('day')

  if (sentTime.isSame(today, 'day')) {
    return 'Today'
  }

  if (sentTime.isSame(today.clone().subtract(1, 'days'), 'day')) {
    return 'Yesterday'
  }

  const thisWeek = today.startOf('week')

  if (sentTime.isSame(thisWeek, 'week')) {
    return 'This Week'
  }

  const recentMonths = today.startOf('month').subtract(2, 'months')

  if (sentTime.isAfter(recentMonths)) {
    // January February ...
    return sentTime.format('MMMM')
  }

  return 'Older'
}
