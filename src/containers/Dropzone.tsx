import { PropsWithChildren } from 'react'
import { useDropzone } from 'react-dropzone'

import DocumentDownload from '~/icons/DocumentDownload'

const Dropzone = ({ children }: PropsWithChildren) => {
  const onDrop = async (files?: FileList | File[] | null) => {
    const { TransferHandler } = await import('~/core/TransferHandler')

    TransferHandler.handleImport(files)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxFiles: 1 })

  return (
    <div className="grid !h-dvh !max-h-dvh bg-base-100" {...getRootProps()} onClick={undefined}>
      <input {...getInputProps()} />

      {isDragActive && (
        <div className="absolute bottom-0 left-0 right-0 top-0 z-[999] flex bg-base-content/30">
          <div className="m-auto h-44 w-44">
            <DocumentDownload />
          </div>
        </div>
      )}

      {children}
    </div>
  )
}

export default Dropzone
