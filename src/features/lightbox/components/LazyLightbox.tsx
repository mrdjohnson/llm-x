import { useEffect, useState, useCallback, useMemo } from 'react'
import Lightbox, { Slide, DownloadFunctionProps } from 'yet-another-react-lightbox'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import Download from 'yet-another-react-lightbox/plugins/download'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import _ from 'lodash'

import { lightboxStore } from '~/features/lightbox/LightboxStore'
import CachedStorage from '~/utils/CachedStorage.platform'

import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import 'yet-another-react-lightbox/plugins/captions.css'

interface ExtendedSlide extends Slide {
  baseId: string
}

const LazyLightbox = () => {
  const [slides, setSlides] = useState<ExtendedSlide[]>([])
  const [error, setError] = useState<string | null>(null)

  const { lightboxSlides, imageUrlIndex } = lightboxStore

  const getAllSlideImages = useCallback(async () => {
    try {
      const processedSlides: ExtendedSlide[] = []

      for (const slide of lightboxSlides) {
        try {
          const src = await CachedStorage.get(slide.src)
          if (!src) {
            console.warn(`Failed to load image: ${slide.src}`)
            continue
          }

          processedSlides.push({
            ...slide,
            src,
          })
        } catch (err) {
          console.error(`Error loading image ${slide.src}:`, err)
        }
      }

      setSlides(processedSlides)
      setError(null)
    } catch (err) {
      console.error('Error processing slides:', err)
      setError('Failed to load images')
    }
  }, [lightboxSlides])

  useEffect(() => {
    getAllSlideImages()
  }, [getAllSlideImages])

  const handleDownload = useCallback(({ slide, saveAs }: DownloadFunctionProps) => {
    let name: string | undefined

    if (_.isString(slide.description)) {
      name = _.snakeCase(slide.description)
    }

    saveAs(slide.src, name)
  }, [])

  const handleView = useCallback(
    ({ index }: { index: number }) => {
      const { src, baseId } = lightboxSlides[index]
      return lightboxStore.setLightboxMessageById(baseId, src)
    },
    [lightboxSlides],
  )

  const plugins = useMemo(() => [Thumbnails, Download, Captions, Zoom], [])

  if (imageUrlIndex === -1 || _.isEmpty(slides)) return null
  if (error) return <div className="error-message">{error}</div>

  return (
    <Lightbox
      close={() => lightboxStore.closeLightbox()}
      plugins={plugins}
      download={{ download: handleDownload }}
      index={imageUrlIndex}
      carousel={{ finite: true }}
      on={{ view: handleView }}
      slides={slides}
      controller={{ closeOnBackdropClick: true }}
      zoom={{ maxZoomPixelRatio: 7 }}
      open
    />
  )
}

export default LazyLightbox
