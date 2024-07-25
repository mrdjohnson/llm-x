import { createId } from '@paralleldrive/cuid2'
import { types } from 'mobx-state-tree'

export const VoiceModel = types.model({
  id: types.optional(types.identifier, createId),
  language: types.string,
  voiceUri: types.string,
})
