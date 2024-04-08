import { ChangeEvent, PropsWithChildren, useRef } from 'react'

import { TransferHandler } from '~/utils/transfer/TransferHandler'

const AttachmentWrapper = ({
  children,
  accept = 'image/*',
}: PropsWithChildren<{ accept?: string }>) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    await TransferHandler.handleImport(event.target.files)

    // reset file input
    event.target.value = ''
  }

  return (
    <span>
      {/* hidden file input */}
      <input
        style={{ display: 'none' }}
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
      />

      <span role="button" onClick={() => fileInputRef.current?.click()}>
        {children}
      </span>
    </span>
  )
}

export default AttachmentWrapper
