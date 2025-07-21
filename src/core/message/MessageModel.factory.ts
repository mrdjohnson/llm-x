import { Factory } from 'fishery'
import { generateMock } from '@anatine/zod-mock'

import { MessageModel } from '~/core/message/MessageModel'
import { messageTable } from '~/core/message/MessageTable'

class MessageModelFactoryClass extends Factory<MessageModel> {}

export const MessageModelFactory = MessageModelFactoryClass.define(
  ({ sequence, params, onCreate }) => {
    onCreate(async messageModel => {
      return messageTable.create(messageModel)
    })

    return {
      ...generateMock(MessageModel),
      ...params,
      id: sequence.toString(),
    }
  },
)
