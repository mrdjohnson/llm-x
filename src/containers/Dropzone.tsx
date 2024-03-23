import { PropsWithChildren } from 'react'
import { useDropzone } from 'react-dropzone'

import DocumentDownload from '../icons/DocumentDownload'
import { chatStore } from '../models/ChatStore'

const Dropzone = ({ children }: PropsWithChildren) => {
  const onDrop = ([file]: File[]) => {
    chatStore.selectedChat?.setPreviewImage(file)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxFiles: 1 })

  return (
    <div
      className="grid h-svh max-h-svh min-h-svh bg-base-100"
      {...getRootProps()}
      onClick={undefined}
    >
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
