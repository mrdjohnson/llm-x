import { ImgHTMLAttributes, useEffect, useState } from 'react'

import CachedStorage from '~/utils/CachedStorage.platform'

const CachedImage = ({ src, ...props }: ImgHTMLAttributes<HTMLImageElement>) => {
  const [imageData, setImageData] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (src) {
      CachedStorage.get(src).then(setImageData)
    }
  }, [src])

  return <img {...props} src={imageData} />
}

export default CachedImage
