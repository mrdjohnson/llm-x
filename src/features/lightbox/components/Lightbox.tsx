import React, { Suspense } from 'react'

const LazyLightbox = React.lazy(() => import('~/features/lightbox/components/LazyLightbox'))

const Lightbox = () => {
  return (
    <Suspense fallback={null}>
      <LazyLightbox />
    </Suspense>
  )
}

export default Lightbox
