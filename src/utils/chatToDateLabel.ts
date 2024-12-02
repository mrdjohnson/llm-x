import moment from 'moment'

import { type ChatViewModel } from '~/core/chat/ChatViewModel'

export const chatToDateLabel = (chat: ChatViewModel) => {
  const sentTime = moment(chat.source.lastMessageTimestamp)

  const today = moment().startOf('day')

  if (sentTime.isAfter(today)) {
    return 'Today'
  }

  if (sentTime.isAfter(today.subtract(1, 'days'))) {
    return 'Yesterday'
  }

  const thisWeek = moment().startOf('week')

  if (sentTime.isAfter(thisWeek)) {
    return 'This Week'
  }

  const thisMonth = moment().startOf('month')

  if (sentTime.isAfter(thisMonth.subtract(2, 'months'))) {
    // January February ...
    return sentTime.format('MMMM')
  }

  return 'Older'
}
