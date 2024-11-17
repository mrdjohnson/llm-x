import _ from 'lodash'
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { observer } from 'mobx-react-lite'

import { incomingMessageStore } from '~/core/IncomingMessageStore'
import { chatStore } from '~/core/chat/ChatStore'

const ScrollableChatFeed = observer((props: React.HtmlHTMLAttributes<HTMLDivElement>) => {
  const chat = chatStore.selectedChat!

  const containerRef = useRef<HTMLDivElement>(null)

  const scroll = useCallback(
    _.throttle(() => {
      if (!containerRef.current) return

      const { offsetHeight, scrollHeight, scrollTop } = containerRef.current

      if (scrollHeight <= scrollTop + offsetHeight + 150) {
        containerRef.current?.scrollTo({ top: scrollHeight, behavior: 'smooth' })
      }
    }, 400),
    [],
  )

  useEffect(() => {
    scroll()
  }, [chat?.messages, incomingMessageStore.incomingData])

  useLayoutEffect(() => {
    setTimeout(() => {
      containerRef.current?.scrollTo(0, containerRef.current.scrollHeight)
    }, 300)
  }, [chat])

  return <div ref={containerRef} {...props} />
})

export default ScrollableChatFeed
