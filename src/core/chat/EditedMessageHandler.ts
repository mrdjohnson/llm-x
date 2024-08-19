import { makeAutoObservable } from 'mobx'

import { MessageViewModel } from '~/core/message/MessageViewModel'
import { messageTable } from '~/core/message/MessageTable'

export class EditedMessageHandler {
  messageToEdit?: MessageViewModel
  variationToEdit?: MessageViewModel

  constructor() {
    makeAutoObservable(this)
  }

  get isEditing() {
    return !!this.messageToEdit
  }

  setMessageToEdit(messageOrVariation?: MessageViewModel) {
    this.messageToEdit = messageOrVariation?.rootMessage
    this.variationToEdit = messageOrVariation
  }

  async commit(content: string, imageUrls: string[]) {
    if (!this.variationToEdit) return

    const message = {
      ...this.variationToEdit.source,
      content,
      imageUrls,
    }

    return messageTable.put(message)
  }
}
