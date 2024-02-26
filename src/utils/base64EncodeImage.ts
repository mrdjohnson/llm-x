export default async function base64EncodeImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Not an image')

  const reader = new FileReader()

  const promise = new Promise<string>((resolve, reject) => {
    reader.onloadend = function () {
      const base64Data = reader.result as string

      resolve(base64Data)
    }

    reader.onerror = function (e) {
      reject(e)
    }
  })

  reader.readAsDataURL(file)

  return promise
}
