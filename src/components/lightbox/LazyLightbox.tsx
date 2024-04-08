import { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import Lightbox, { Slide } from 'yet-another-react-lightbox'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import Download from 'yet-another-react-lightbox/plugins/download'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import _ from 'lodash'

import { chatStore } from '~/models/ChatStore'
import CachedStorage from '~/utils/CachedStorage'

import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import 'yet-another-react-lightbox/plugins/captions.css'

const LazyLightbox = observer(() => {
  const [slides, setSlides] = useState<Array<Slide & { uniqId: string }>>([])
  const chat = chatStore.selectedChat

  const getAllSlideImages = async () => {
    if (!chat) return

    const slides = []

    for (const slide of chat.lightboxSlides) {
      const src = await CachedStorage.get(slide.src)

      if (src) {
        slides.push({
          ...slide,
          src,
        })
      }
    }

    setSlides(slides)
  }

  useEffect(() => {
    getAllSlideImages()
  }, [chat?.lightboxSlides?.length])

  if (!chat) return null

  const index = chat.lightboxMessageIndex
  if (index === -1 || _.isEmpty(slides)) return null

  return (
    <Lightbox
      close={chat.closeLightbox}
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
      index={index}
      carousel={{ finite: true }}
      on={{
        view: ({ index }) => chat.setLightboxMessageById(slides[index].uniqId),
      }}
      slides={slides}
      controller={{ closeOnBackdropClick: true }}
      zoom={{ maxZoomPixelRatio: 7 }}
      open
    />
  )
})

export default LazyLightbox
