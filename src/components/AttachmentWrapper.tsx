import { ChangeEvent, PropsWithChildren, useRef } from 'react'

import { TransferHandler } from '~/core/TransferHandler'

const AttachmentWrapper = ({
  children,
  accept = 'image/*',
  className,
}: PropsWithChildren<{ accept?: string; className?: string }>) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    await TransferHandler.handleImport(event.target.files)

    // reset file input
    event.target.value = ''
  }

  return (
    <span className={className}>
      {/* hidden file input */}
      <input
        style={{ display: 'none' }}
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        multiple
      />

      <span role="button" className="contents" onClick={() => fileInputRef.current?.click()}>
        {children}
      </span>
    </span>
  )
}

export default AttachmentWrapper
