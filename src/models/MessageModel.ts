import _ from 'lodash'
import { types, Instance } from 'mobx-state-tree'

const MessageErrorModel = types.model({
  message: types.string,
  stack: types.maybe(types.string),
})

const MessageExtrasModel = types.model({
  error: types.maybe(MessageErrorModel),
})

export const MessageModel = types
  .model({
    fromBot: types.boolean,
    // this should have been modelName
    botName: types.maybe(types.string),
    content: types.optional(types.string, ''),
    image: types.maybe(types.string),
    uniqId: types.identifier,
    extras: types.maybe(MessageExtrasModel),
  })
  .actions(self => ({
    setError(error: Error) {
      self.extras ||= MessageExtrasModel.create()

      const { message, stack } = error

      self.extras.error = MessageErrorModel.create({ message, stack })
    },
  }))

export interface IMessageModel extends Instance<typeof MessageModel> {}
