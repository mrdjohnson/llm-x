import _ from 'lodash'
import { types, Instance, cast } from 'mobx-state-tree'

const MessageErrorModel = types.model({
  message: types.string,
  stack: types.maybe(types.string),
})

const MessageExtrasModel = types
  .model({
    error: types.maybe(MessageErrorModel),
    errors: types.array(MessageErrorModel),
  })
  .actions(self => ({
    afterCreate() {
      // transition from v1
      if (self.error) {
        const error = self.error

        self.error = undefined

        self.errors = cast([error])
      }
    },
  }))

export const MessageModel = types
  .model({
    fromBot: types.boolean,
    botName: types.maybe(types.string),
    content: types.optional(types.string, ''),
    image: types.maybe(types.string),
    uniqId: types.identifier,
    extras: types.maybe(MessageExtrasModel),
  })
  .actions(self => ({
    addError(error: Error) {
      self.extras ||= MessageExtrasModel.create()

      const { message, stack } = error

      self.extras.errors.push(MessageErrorModel.create({ message, stack }))
    },
  }))

export interface IMessageModel extends Instance<typeof MessageModel> {}
