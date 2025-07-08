import { makeAutoObservable } from 'mobx'

class FocusStore {
  shouldFocusChatInput = false

  constructor() {
    makeAutoObservable(this)
  }

  focusChatInput() {
    this.shouldFocusChatInput = true
  }

  clearFocusRequest() {
    this.shouldFocusChatInput = false
  }
}

export const focusStore = new FocusStore()
