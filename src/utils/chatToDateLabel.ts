import moment from 'moment'

import { ChatModel } from '~/core/chat/ChatModel'

export const chatToDateLabel = (chat: ChatModel) => {
  const sentTime = moment(chat.lastMessageTimestamp)

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
