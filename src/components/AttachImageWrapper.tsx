import { ChangeEvent, PropsWithChildren, useRef } from 'react'
import { chatStore } from '../models/ChatStore'

const AttachImageWrapper = ({ children }: PropsWithChildren) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const chat = chatStore.selectedChat!

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    // reset file input
    event.target.value = ''

    chat.setPreviewImage(file)
  }

  return (
    <span>
      {/* hidden file input */}
      <input
        style={{ display: 'none' }}
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />

      <span role="button" onClick={() => fileInputRef.current?.click()}>
        {children}
      </span>
    </span>
  )
}

export default AttachImageWrapper
