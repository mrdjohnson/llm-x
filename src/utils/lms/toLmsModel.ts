import { DownloadedModel } from '@lmstudio/sdk'

export const toLmsModel = (model: DownloadedModel) => {
  const labelData = model.path.match(/(?<folder>[^/]*)\/(?<name>.*)/)?.groups || {
    folder: '',
    name: model.path,
  }

  return {
    ...model,

    get gbSize() {
      return (model.sizeBytes / 1e9).toFixed(2) + ' GB'
    },

    get name(): string {
      return labelData.name || model.path
    },

    get folder(): string {
      return labelData.folder || ''
    },
  }
}
