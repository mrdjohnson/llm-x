import React, { Suspense } from 'react'

const LazyLightbox = React.lazy(() => import('~/components/lightbox/LazyLightbox'))

const Lightbox = () => {
  return (
    <Suspense fallback={null}>
      <LazyLightbox />
    </Suspense>
  )
}

export default Lightbox
