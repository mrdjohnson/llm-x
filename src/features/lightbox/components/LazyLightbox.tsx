import { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import Lightbox, { Slide } from 'yet-another-react-lightbox'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import Download from 'yet-another-react-lightbox/plugins/download'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import _ from 'lodash'

import { lightboxStore } from '~/features/lightbox/LightboxStore'
import CachedStorage from '~/utils/CachedStorage'

import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import 'yet-another-react-lightbox/plugins/captions.css'

const LazyLightbox = observer(() => {
  const [slides, setSlides] = useState<Array<Slide & { baseUniqId: string }>>([])
  const { chat, lightboxSlides, imageUrlIndex } = lightboxStore

  const getAllSlideImages = async () => {
    if (!chat) return

    const slides: Array<Slide & { baseUniqId: string }> = []

    for (const slide of lightboxSlides) {
      const src = await CachedStorage.get(slide.src)

      slides.push({
        ...slide,
        src: src ?? '',
      })
    }

    setSlides(slides)
  }

  useEffect(() => {
    getAllSlideImages()
  }, [lightboxSlides?.length])

  if (!chat) return null

  if (imageUrlIndex === -1 || _.isEmpty(slides)) return null

  return (
    <Lightbox
      close={lightboxStore.closeLightbox}
      plugins={[Thumbnails, Download, Captions, Zoom]}
      download={{
        download: ({ slide, saveAs }) => {
          let name: string | undefined

          if (_.isString(slide.description)) {
            name = _.snakeCase(slide.description)
          }

          saveAs(slide.src, name)
        },
      }}
      index={imageUrlIndex}
      carousel={{ finite: true }}
      on={{
        view: ({ index }) => {
          const { src, baseUniqId } = lightboxSlides[index]

          return lightboxStore.setLightboxMessageById(baseUniqId, src)
        },
      }}
      slides={slides}
      controller={{ closeOnBackdropClick: true }}
      zoom={{ maxZoomPixelRatio: 7 }}
      open
    />
  )
})

export default LazyLightbox
