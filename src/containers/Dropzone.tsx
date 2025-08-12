import { AppShell, LoadingOverlay } from '@mantine/core'
import { PropsWithChildren } from 'react'
import { useDropzone } from 'react-dropzone'
import useMedia from 'use-media'

import DocumentDownload from '~/icons/DocumentDownload'
import { settingStore } from '~/core/setting/SettingStore'

const Dropzone = ({ children }: PropsWithChildren) => {
  const isMobile = useMedia('(max-width: 768px)')
  const isSidebarOpen = settingStore.setting.isSidebarOpen

  const onDrop = async (files?: FileList | File[] | null) => {
    const { TransferHandler } = await import('~/core/TransferHandler')

    TransferHandler.handleImport(files)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxFiles: 1 })

  return (
    <AppShell
      {...getRootProps()}
      navbar={{
        breakpoint: 768,
        width: isSidebarOpen ? 260 : 60,
        collapsed: { mobile: true, desktop: false },
      }}
      header={{ height: isMobile && !isSidebarOpen ? 60 : 0 }}
      onClick={undefined}
      transitionDuration={300}
      transitionTimingFunction="ease-in-out"
    >
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
