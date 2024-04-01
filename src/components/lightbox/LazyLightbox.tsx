import { observer } from 'mobx-react-lite'
import Lightbox from 'yet-another-react-lightbox'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import Download from 'yet-another-react-lightbox/plugins/download'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'

import { chatStore } from '~/models/ChatStore'

import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import 'yet-another-react-lightbox/plugins/captions.css'

const LazyLightbox = observer(() => {
  const chat = chatStore.selectedChat

  if (!chat) return null

  const index = chat.lightboxMessageIndex
  if (index === -1) return null

  const messages = chat.lightboxMessagesWithPrompts

  return (
    <Lightbox
      close={chat.closeLightbox}
      plugins={[Thumbnails, Download, Captions, Zoom]}
      index={index}
      carousel={{ finite: true }}
      on={{
        view: ({ index }) => chat.setLightboxMessage(messages[index].message),
      }}
      slides={messages.map(({ message, userPrompt }) => ({
        src: message.image!,
        description: userPrompt,
      }))}
      controller={{ closeOnBackdropClick: true }}
      zoom={{ maxZoomPixelRatio: 7 }}
      open
    />
  )
})

export default LazyLightbox
