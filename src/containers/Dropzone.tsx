import { AppShell, LoadingOverlay } from '@mantine/core'
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
    <AppShell {...getRootProps()} onClick={undefined}>
      <input {...getInputProps()} />

      {isDragActive && (
        <LoadingOverlay
          visible
          overlayProps={{ blur: 2 }}
          loaderProps={{
            children: (
              <div className="m-auto h-44 w-44">
                <DocumentDownload />
              </div>
            ),
          }}
        />
      )}

      {children}
    </AppShell>
  )
}

export default Dropzone
