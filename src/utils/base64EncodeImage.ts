export default async function base64EncodeImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('images only')

  const reader = new FileReader()

  const promise = new Promise<string>((resolve, reject) => {
    reader.onloadend = function () {
      const base64Data = reader.result as string

      resolve(base64Data)
    }

    reader.onerror = function () {
      reject('unable to read blob')
    }
  })

  reader.readAsDataURL(file)

  return promise
}
