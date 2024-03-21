import { types, Instance } from 'mobx-state-tree'
import _ from 'lodash'
import moment from 'moment'

const OllamaModelDetails = types.model({
  parameterSize: types.maybe(types.string),
  families: types.maybeNull(types.array(types.string)),
})

export const OllamaModel = types
  .model({
    name: types.identifier,
    model: types.string,
    digest: types.string,
    modifiedAt: types.string,
    size: types.number,
    details: OllamaModelDetails,
  })
  .views(self => ({
    // inspiration for gbSize and timeAgo are from chat-ollama!

    get gbSize() {
      return (self.size / 1e9).toFixed(2) + ' GB'
    },

    get timeAgo() {
      return moment(self.modifiedAt).fromNow()
    },

    get supportsImages() {
      return self.details.families?.includes('clip') || false
    },

    get paramSize() {
      if (self.details.parameterSize) {
        return parseInt(self.details.parameterSize)
      } else {
        return NaN
      }
    },
  }))

export interface IOllamaModel extends Instance<typeof OllamaModel> {}
